const pool = require('../config/db');
const whatsappService = require('../services/whatsappService');

// Historial de mensajes enviados (con filtro opcional por cliente)
async function listar(req, res) {
  try {
    const { cliente_id } = req.query;
    let query = `SELECT m.*, cl.nombre as cliente_nombre FROM mensajes_enviados m
                 JOIN clientes cl ON cl.id = m.cliente_id`;
    const params = [];

    if (cliente_id) {
      query += ' WHERE m.cliente_id = $1';
      params.push(cliente_id);
    }
    query += ' ORDER BY m.fecha_envio DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar mensajes.' });
  }
}

// Reenviar manualmente un mensaje (ej. si fallo el envio)
async function reenviar(req, res) {
  try {
    const original = await pool.query('SELECT * FROM mensajes_enviados WHERE id = $1', [req.params.id]);
    if (original.rows.length === 0) return res.status(404).json({ error: 'Mensaje no encontrado.' });

    const msg = original.rows[0];
    const cliente = await pool.query('SELECT telefono FROM clientes WHERE id = $1', [msg.cliente_id]);

    await pool.query(
      "UPDATE mensajes_enviados SET estado_envio = 'enviado', fecha_envio = NOW() WHERE id = $1",
      [msg.id]
    );

    res.json({ mensaje: 'Mensaje reenviado (revisa la consola del servidor si estas en modo simulado).' });
    console.log('[Reenvio manual] a', cliente.rows[0].telefono, ':', msg.contenido_enviado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reenviar el mensaje.' });
  }
}

// Simula la llegada de una respuesta del cliente (en produccion esto lo
// dispara un webhook real de Meta cuando el cliente escribe por WhatsApp)
async function registrarRespuesta(req, res) {
  const { respuesta } = req.body;
  if (!respuesta) return res.status(400).json({ error: 'La respuesta es obligatoria.' });
  try {
    await whatsappService.registrarRespuestaCliente({ mensajeId: req.params.id, respuesta });
    res.json({ mensaje: 'Respuesta registrada y Operador notificado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la respuesta.' });
  }
}

// Notificaciones internas pendientes para el usuario logueado
async function notificacionesPendientes(req, res) {
  try {
    const result = await pool.query(
      `SELECT n.*, m.contenido_enviado, m.respuesta_cliente, cl.nombre as cliente_nombre, cl.telefono
       FROM notificaciones_internas n
       JOIN mensajes_enviados m ON m.id = n.mensaje_id
       JOIN clientes cl ON cl.id = m.cliente_id
       WHERE n.operador_id = $1 AND n.leido = FALSE
       ORDER BY n.fecha_creacion DESC`,
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
}

async function marcarLeida(req, res) {
  try {
    await pool.query('UPDATE notificaciones_internas SET leido = TRUE WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Notificacion marcada como leida.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la notificacion.' });
  }
}

module.exports = { listar, reenviar, registrarRespuesta, notificacionesPendientes, marcarLeida };
