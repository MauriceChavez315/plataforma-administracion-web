const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const query = `
      SELECT u.*, r.nombre as rol_nombre, r.es_fijo, 
             COALESCE(json_agg(p.codigo) FILTER (WHERE p.codigo IS NOT NULL), '[]') as permisos
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      LEFT JOIN rol_permisos rp ON r.id = rp.rol_id
      LEFT JOIN permisos p ON rp.permiso_id = p.id
      WHERE u.email = $1 AND u.activo = TRUE
      GROUP BY u.id, r.nombre, r.es_fijo
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const usuario = result.rows[0];
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol_nombre, permisos: usuario.permisos },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        rol: usuario.rol_nombre, 
        email: usuario.email,
        permisos: usuario.permisos 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesion.' });
  }
}

module.exports = { login };
