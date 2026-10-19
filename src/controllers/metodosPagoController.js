const pool = require('../config/db');

async function listar(req, res) {
  try {
    const result = await pool.query('SELECT * FROM metodos_pago ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar metodos de pago' });
  }
}

async function crear(req, res) {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await pool.query(
      'INSERT INTO metodos_pago (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe un metodo de pago con este nombre' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear metodo de pago' });
  }
}

async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, activo } = req.body;
  
  if (!nombre && activo === undefined) {
    return res.status(400).json({ error: 'Debe enviar nombre o estado activo' });
  }

  try {
    const result = await pool.query(
      `UPDATE metodos_pago 
       SET nombre = COALESCE($1, nombre),
           activo = COALESCE($2, activo)
       WHERE id = $3 RETURNING *`,
      [nombre, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Metodo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un metodo de pago con este nombre' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar metodo de pago' });
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM metodos_pago WHERE id = $1', [id]);
    res.json({ message: 'Metodo eliminado' });
  } catch (err) {
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'No se puede eliminar porque hay pagos registrados con este metodo.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar metodo de pago' });
  }
}

module.exports = { listar, crear, actualizar, eliminar };
