const pool = require('../config/db');

async function listar(req, res) {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY fecha_registro DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar clientes.' });
  }
}

async function obtener(req, res) {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente.' });
  }
}

async function crear(req, res) {
  const { nombre, telefono, notas } = req.body;
  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y telefono son obligatorios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, telefono, notas) VALUES ($1, $2, $3) RETURNING *',
      [nombre, telefono, notas || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente.' });
  }
}

async function actualizar(req, res) {
  const { nombre, telefono, notas } = req.body;
  try {
    const result = await pool.query(
      'UPDATE clientes SET nombre = $1, telefono = $2, notas = $3 WHERE id = $4 RETURNING *',
      [nombre, telefono, notas || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente.' });
  }
}

async function eliminar(req, res) {
  try {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    res.json({ mensaje: 'Cliente eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente.' });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
