const metricsService = require('../services/metricsService');

async function resumen(req, res) {
  try {
    const data = await metricsService.obtenerResumenPeriodo();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular metricas.' });
  }
}

module.exports = { resumen };
