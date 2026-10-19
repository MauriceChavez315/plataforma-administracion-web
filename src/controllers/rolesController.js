const pool = require('../config/db');

// Listar todos los permisos disponibles en el sistema
exports.listarPermisos = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM permisos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Listar todos los roles con sus permisos asociados
exports.listarRoles = async (req, res, next) => {
  try {
    const query = `
      SELECT r.id, r.nombre, r.es_fijo, 
             COALESCE(json_agg(p.codigo) FILTER (WHERE p.codigo IS NOT NULL), '[]') as permisos
      FROM roles r
      LEFT JOIN rol_permisos rp ON r.id = rp.rol_id
      LEFT JOIN permisos p ON rp.permiso_id = p.id
      GROUP BY r.id
      ORDER BY r.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Crear un nuevo rol (espera { nombre, permisos: ['ver_dashboard', 'gestionar_clientes'] })
exports.crearRol = async (req, res, next) => {
  const { nombre, permisos } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre del rol es obligatorio.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insertar rol
    const insertRol = await client.query(
      'INSERT INTO roles (nombre) VALUES ($1) RETURNING id, nombre',
      [nombre]
    );
    const rolId = insertRol.rows[0].id;

    // Insertar permisos si los hay
    if (permisos && permisos.length > 0) {
      for (const codigo of permisos) {
        // Obtener ID del permiso a partir del código
        const pResult = await client.query('SELECT id FROM permisos WHERE codigo = $1', [codigo]);
        if (pResult.rows.length > 0) {
          const permisoId = pResult.rows[0].id;
          await client.query(
            'INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2)',
            [rolId, permisoId]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Rol creado con éxito', id: rolId });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre.' });
    }
    next(err);
  } finally {
    client.release();
  }
};

// Actualizar un rol existente
exports.actualizarRol = async (req, res, next) => {
  const { id } = req.params;
  const { nombre, permisos } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar si es fijo
    const checkRol = await client.query('SELECT es_fijo FROM roles WHERE id = $1', [id]);
    if (checkRol.rows.length === 0) throw { status: 404, message: 'Rol no encontrado' };
    
    if (checkRol.rows[0].es_fijo) {
      throw { status: 403, message: 'Este rol es fijo del sistema (Super Admin) y no puede ser modificado.' };
    }

    // Actualizar nombre
    if (nombre) {
      await client.query('UPDATE roles SET nombre = $1 WHERE id = $2', [nombre, id]);
    }

    // Actualizar permisos: eliminamos los viejos e insertamos los nuevos
    if (Array.isArray(permisos)) {
      await client.query('DELETE FROM rol_permisos WHERE rol_id = $1', [id]);
      for (const codigo of permisos) {
        const pResult = await client.query('SELECT id FROM permisos WHERE codigo = $1', [codigo]);
        if (pResult.rows.length > 0) {
          const permisoId = pResult.rows[0].id;
          await client.query(
            'INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2)',
            [id, permisoId]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Rol actualizado exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Eliminar un rol
exports.eliminarRol = async (req, res, next) => {
  const { id } = req.params;
  try {
    const checkRol = await pool.query('SELECT es_fijo FROM roles WHERE id = $1', [id]);
    if (checkRol.rows.length === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    
    if (checkRol.rows[0].es_fijo) {
      return res.status(403).json({ error: 'Este rol es fijo y no puede ser eliminado.' });
    }

    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.json({ message: 'Rol eliminado' });
  } catch (err) {
    // 23503: foreign_key_violation -> Si hay usuarios con este rol
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar este rol porque hay usuarios asignados a él.' });
    }
    next(err);
  }
};
