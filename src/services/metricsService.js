const pool = require('../config/db');

/*
  Calcula el rango de fechas del periodo actual y el anterior,
  segun la frecuencia ('diario' o 'semanal'/'mensual').
  Para el MVP usamos 'mensual' como base de comparacion de ingresos,
  independientemente de la frecuencia de envio del resumen.
*/
function calcularRangos() {
  const hoy = new Date();
  const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  return { inicioMesActual, inicioMesAnterior, finMesAnterior };
}

async function obtenerResumenPeriodo() {
  const { inicioMesActual, inicioMesAnterior, finMesAnterior } = calcularRangos();

  const montoActualResult = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE fecha_pago >= $1',
    [inicioMesActual]
  );

  const montoAnteriorResult = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE fecha_pago >= $1 AND fecha_pago <= $2',
    [inicioMesAnterior, finMesAnterior]
  );

  const renovacionesResult = await pool.query(
    "SELECT COUNT(*) as total FROM pagos WHERE tipo = 'renovacion' AND fecha_pago >= $1",
    [inicioMesActual]
  );

  const estadosResult = await pool.query(
    `SELECT estado, COUNT(*) as total FROM cuentas GROUP BY estado`
  );

  const incidenciasResult = await pool.query(
    "SELECT COUNT(*) as total FROM incidencias WHERE estado != 'resuelta'"
  );

  const estados = {};
  estadosResult.rows.forEach(fila => { estados[fila.estado] = parseInt(fila.total, 10); });

  return {
    montoActual: parseFloat(montoActualResult.rows[0].total).toFixed(2),
    montoAnterior: parseFloat(montoAnteriorResult.rows[0].total).toFixed(2),
    renovacionesPeriodo: parseInt(renovacionesResult.rows[0].total, 10),
    cuentasActivas: estados.activa || 0,
    cuentasPorVencer: estados.por_vencer || 0,
    cuentasVencidas: estados.vencida || 0,
    cuentasCanceladas: estados.cancelada || 0,
    incidenciasAbiertas: parseInt(incidenciasResult.rows[0].total, 10)
  };
}

module.exports = { obtenerResumenPeriodo };
