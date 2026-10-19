const pool = require('../config/db');

async function listar(req, res) {
  try {
    const result = await pool.query('SELECT * FROM plantillas_mensajes ORDER BY tipo_evento ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar plantillas.' });
  }
}

async function actualizar(req, res) {
  const { contenido, activa } = req.body;
  try {
    const result = await pool.query(
      'UPDATE plantillas_mensajes SET contenido = COALESCE($1, contenido), activa = COALESCE($2, activa) WHERE id = $3 RETURNING *',
      [contenido, activa, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plantilla no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la plantilla.' });
  }
}

module.exports = { listar, actualizar };
