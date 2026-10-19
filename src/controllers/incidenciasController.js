const pool = require('../config/db');

async function listar(req, res) {
  try {
    const result = await pool.query(
      `SELECT i.*, cl.nombre as cliente_nombre, s.nombre as servicio_nombre
       FROM incidencias i
       JOIN cuentas c ON c.id = i.cuenta_id
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN servicios s ON s.id = c.servicio_id
       ORDER BY i.fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar incidencias.' });
  }
}

async function crear(req, res) {
  const { cuenta_id, descripcion } = req.body;
  if (!cuenta_id || !descripcion) {
    return res.status(400).json({ error: 'La cuenta y la descripcion son obligatorias.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO incidencias (cuenta_id, descripcion, estado) VALUES ($1, $2, 'abierta') RETURNING *`,
      [cuenta_id, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la incidencia.' });
  }
}

async function actualizar(req, res) {
  const { estado, notas_resolucion } = req.body;
  const fechaResolucion = estado === 'resuelta' ? new Date() : null;
  try {
    const result = await pool.query(
      `UPDATE incidencias SET estado = COALESCE($1, estado),
                              notas_resolucion = COALESCE($2, notas_resolucion),
                              fecha_resolucion = COALESCE($3, fecha_resolucion)
       WHERE id = $4 RETURNING *`,
      [estado, notas_resolucion, fechaResolucion, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incidencia no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la incidencia.' });
  }
}

module.exports = { listar, crear, actualizar };
