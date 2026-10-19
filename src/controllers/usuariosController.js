const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Solo Super Admin puede llegar a estos endpoints (ver rutas)

async function listar(req, res) {
  try {
    const query = `
      SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.fecha_creacion, 
             r.nombre as rol, r.id as rol_id
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios.' });
  }
}

async function crear(req, res) {
  const { nombre, email, password, telefono, rol } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Nombre, correo, contraseña y rol son obligatorios.' });
  }
  
  try {
    // Buscar rol_id basado en el ID recibido, o en el nombre si es un texto (por retrocompatibilidad temporal, pero idealmente recibimos el rol_id)
    let rolId = parseInt(rol, 10);
    if (isNaN(rolId)) {
      const rolRes = await pool.query('SELECT id FROM roles WHERE nombre = $1', [rol]);
      if (rolRes.rows.length === 0) return res.status(400).json({ error: 'Rol no encontrado.' });
      rolId = rolRes.rows[0].id;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, telefono, rol_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, telefono, rol_id',
      [nombre, email, hash, telefono || null, rolId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el usuario (el correo puede ya estar en uso).' });
  }
}

// Cambiar rol o estado activo de un usuario (exclusivo Super Admin)
async function actualizar(req, res) {
  const { rol, activo, telefono } = req.body;
  
  try {
    let rolId = null;
    if (rol) {
      rolId = parseInt(rol, 10);
      if (isNaN(rolId)) {
        const rolRes = await pool.query('SELECT id FROM roles WHERE nombre = $1', [rol]);
        if (rolRes.rows.length > 0) rolId = rolRes.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE usuarios SET rol_id = COALESCE($1, rol_id),
                           activo = COALESCE($2, activo),
                           telefono = COALESCE($3, telefono)
       WHERE id = $4 RETURNING id, nombre, email, telefono, rol_id, activo`,
      [rolId, activo, telefono, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
}

module.exports = { listar, crear, actualizar };
