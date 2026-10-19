/*
  Servicio de envio de WhatsApp.

  MODO SIMULADO (WHATSAPP_MODE=simulado en .env):
    No se conecta a ningun servidor externo. Solo imprime en consola
    el mensaje que se habria enviado y lo guarda en la base de datos
    igual que si hubiera sido enviado de verdad (estado_envio = 'enviado').
    Esto te permite probar TODO el flujo (avisos, cancelaciones, resumenes)
    sin tener aun la cuenta de Meta Business.

  MODO REAL (WHATSAPP_MODE=real en .env):
    Usa la API oficial de WhatsApp Cloud (Meta) para enviar plantillas
    aprobadas. Requiere WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID validos.

  Para pasar de simulado a real, solo cambias la variable de entorno
  WHATSAPP_MODE y completas el token y el phone_number_id.
  El resto del sistema (rutas, controladores, cron) no cambia en nada.
*/

const pool = require('../config/db');

async function enviarMensajeReal(telefono, contenido) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: { body: contenido }
      // Nota: en produccion, para mensajes que TU inicias (avisos,
      // vencimientos, resumen), Meta exige usar "template" en vez de
      // "text" con una plantilla ya aprobada. Este texto plano funciona
      // para respuestas dentro de la ventana de 24h posterior a que el
      // cliente escriba, o mientras pruebas con numeros de prueba de Meta.
    })
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

function reemplazarVariables(plantilla, variables) {
  let resultado = plantilla;
  for (const [clave, valor] of Object.entries(variables)) {
    resultado = resultado.replaceAll(`{{${clave}}}`, valor);
  }
  return resultado;
}

/*
  Funcion principal: envia un mensaje a un cliente y deja registro en
  la tabla mensajes_enviados. Devuelve el id del mensaje creado.
*/
async function enviarMensaje({ clienteId, cuentaId = null, tipoEvento, telefono, variables }) {
  const plantillaResult = await pool.query(
    'SELECT contenido FROM plantillas_mensajes WHERE tipo_evento = $1 AND activa = TRUE',
    [tipoEvento]
  );

  if (plantillaResult.rows.length === 0) {
    throw new Error(`No existe una plantilla activa para el evento "${tipoEvento}".`);
  }

  const contenido = reemplazarVariables(plantillaResult.rows[0].contenido, variables);
  let estadoEnvio = 'enviado';

  try {
    if (process.env.WHATSAPP_MODE === 'real') {
      await enviarMensajeReal(telefono, contenido);
    } else {
      console.log('----------------------------------------');
      console.log('[WHATSAPP SIMULADO] Se enviaria a:', telefono);
      console.log('Mensaje:', contenido);
      console.log('----------------------------------------');
    }
  } catch (err) {
    console.error('Error enviando WhatsApp:', err.message);
    estadoEnvio = 'fallido';
  }

  const insert = await pool.query(
    `INSERT INTO mensajes_enviados (cliente_id, cuenta_id, tipo_evento, contenido_enviado, estado_envio)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [clienteId, cuentaId, tipoEvento, contenido, estadoEnvio]
  );

  return insert.rows[0].id;
}

/*
  Registra la respuesta de un cliente a un mensaje previamente enviado
  y crea una notificacion interna para todos los operadores/super admins.
*/
async function registrarRespuestaCliente({ mensajeId, respuesta }) {
  await pool.query(
    'UPDATE mensajes_enviados SET respuesta_cliente = $1, fecha_respuesta = NOW() WHERE id = $2',
    [respuesta, mensajeId]
  );

  const operadores = await pool.query(
    "SELECT id FROM usuarios WHERE rol IN ('operador', 'super_admin') AND activo = TRUE"
  );

  for (const operador of operadores.rows) {
    await pool.query(
      'INSERT INTO notificaciones_internas (operador_id, mensaje_id) VALUES ($1, $2)',
      [operador.id, mensajeId]
    );
  }
}

module.exports = { enviarMensaje, registrarRespuestaCliente };
