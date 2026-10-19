/*
  Tareas automaticas diarias:
  1. Avisar 3 dias antes del vencimiento (o los dias que diga la config).
  2. Marcar como "vencida" y avisar el mismo dia del vencimiento.
  3. Enviar el resumen periodico al Administrador (segun configuracion).

  Se ejecuta todos los dias a las 9:00am (hora del servidor).
  Ajusta la expresion cron si necesitas otro horario.
*/

const cron = require('node-cron');
const pool = require('../config/db');
const whatsappService = require('./whatsappService');
const metricsService = require('./metricsService');

async function obtenerConfig(clave, valorPorDefecto) {
  const result = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', [clave]);
  return result.rows.length > 0 ? result.rows[0].valor : valorPorDefecto;
}

async function revisarAvisosPrevios() {
  const diasAviso = parseInt(await obtenerConfig('dias_aviso_previo', '3'), 10);

  const cuentas = await pool.query(
    `SELECT c.id, c.fecha_vencimiento, cl.id as cliente_id, cl.nombre as cliente_nombre,
            cl.telefono, s.nombre as servicio_nombre
     FROM cuentas c
     JOIN clientes cl ON cl.id = c.cliente_id
     JOIN servicios s ON s.id = c.servicio_id
     WHERE c.estado = 'activa'
       AND c.fecha_vencimiento = CURRENT_DATE + ($1 || ' days')::interval`,
    [diasAviso]
  );

  for (const cuenta of cuentas.rows) {
    await whatsappService.enviarMensaje({
      clienteId: cuenta.cliente_id,
      cuentaId: cuenta.id,
      tipoEvento: 'aviso_previo',
      telefono: cuenta.telefono,
      variables: {
        nombre: cuenta.cliente_nombre,
        servicio: cuenta.servicio_nombre,
        fecha_vencimiento: cuenta.fecha_vencimiento.toISOString().split('T')[0]
      }
    });

    await pool.query("UPDATE cuentas SET estado = 'por_vencer' WHERE id = $1", [cuenta.id]);
  }

  console.log(`[Scheduler] Avisos previos enviados: ${cuentas.rows.length}`);
}

async function revisarVencimientos() {
  const cuentas = await pool.query(
    `SELECT c.id, cl.id as cliente_id, cl.nombre as cliente_nombre,
            cl.telefono, s.nombre as servicio_nombre
     FROM cuentas c
     JOIN clientes cl ON cl.id = c.cliente_id
     JOIN servicios s ON s.id = c.servicio_id
     WHERE c.estado IN ('activa', 'por_vencer')
       AND c.fecha_vencimiento <= CURRENT_DATE`
  );

  for (const cuenta of cuentas.rows) {
    await pool.query("UPDATE cuentas SET estado = 'vencida' WHERE id = $1", [cuenta.id]);

    await whatsappService.enviarMensaje({
      clienteId: cuenta.cliente_id,
      cuentaId: cuenta.id,
      tipoEvento: 'vencimiento',
      telefono: cuenta.telefono,
      variables: {
        nombre: cuenta.cliente_nombre,
        servicio: cuenta.servicio_nombre
      }
    });
  }

  console.log(`[Scheduler] Cuentas marcadas como vencidas: ${cuentas.rows.length}`);
}

async function enviarResumenAdministradores() {
  const frecuencia = await obtenerConfig('frecuencia_resumen_admin', 'semanal');
  const hoy = new Date();
  const esLunes = hoy.getDay() === 1;

  // Si la frecuencia es semanal, solo se envia los lunes.
  // Si es diaria, se envia todos los dias.
  if (frecuencia === 'semanal' && !esLunes) return;

  const metrics = await metricsService.obtenerResumenPeriodo(frecuencia);

  const administradores = await pool.query(
    "SELECT id, nombre, telefono FROM usuarios WHERE rol = 'administrador' AND activo = TRUE AND telefono IS NOT NULL"
  );

  for (const admin of administradores.rows) {
    await whatsappService.enviarMensaje({
      clienteId: null,
      tipoEvento: 'resumen_admin',
      telefono: admin.telefono,
      variables: {
        periodo: frecuencia,
        monto_actual: metrics.montoActual,
        monto_anterior: metrics.montoAnterior,
        activas: metrics.cuentasActivas,
        vencidas: metrics.cuentasVencidas,
        incidencias: metrics.incidenciasAbiertas
      }
    });
  }

  console.log(`[Scheduler] Resumen enviado a ${administradores.rows.length} administrador(es).`);
}

function iniciarTareasProgramadas() {
  // Todos los dias a las 9:00 am
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Ejecutando revision diaria de cuentas...');
    try {
      await revisarAvisosPrevios();
      await revisarVencimientos();
      await enviarResumenAdministradores();
    } catch (err) {
      console.error('[Scheduler] Error en la revision diaria:', err.message);
    }
  });

  console.log('[Scheduler] Tareas programadas iniciadas (todos los dias a las 9:00am).');
}

module.exports = {
  iniciarTareasProgramadas,
  revisarAvisosPrevios,
  revisarVencimientos,
  enviarResumenAdministradores
};
