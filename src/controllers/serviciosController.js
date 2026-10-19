const pool = require('../config/db');

// Listar todas las plataformas con estadísticas agregadas
async function listar(req, res) {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(DISTINCT cm.id)::int as total_cuentas_maestras,
             COUNT(DISTINCT c.id) FILTER (WHERE c.estado = 'activa')::int as total_cuentas_activas,
             COALESCE(SUM(cm.perfiles_totales), 0)::int as capacidad_perfiles,
             COALESCE(SUM(cm.perfiles_ocupados), 0)::int as perfiles_ocupados
      FROM servicios s
      LEFT JOIN cuentas_maestras cm ON cm.servicio_id = s.id
      LEFT JOIN cuentas c ON c.servicio_id = s.id
      GROUP BY s.id
      ORDER BY s.nombre ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar plataformas/servicios:', err);
    res.status(500).json({ error: 'Error al listar plataformas.' });
  }
}

// Obtener una plataforma específica por ID con sus cuentas maestras
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const servicioResult = await pool.query('SELECT * FROM servicios WHERE id = $1', [id]);
    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plataforma no encontrada.' });
    }

    const cuentasMaestrasResult = await pool.query(
      'SELECT * FROM cuentas_maestras WHERE servicio_id = $1 ORDER BY id ASC',
      [id]
    );

    res.json({
      ...servicioResult.rows[0],
      cuentas_maestras: cuentasMaestrasResult.rows
    });
  } catch (err) {
    console.error('Error al obtener plataforma:', err);
    res.status(500).json({ error: 'Error al obtener datos de la plataforma.' });
  }
}

// Crear nueva plataforma
async function crear(req, res) {
  const { nombre, precio_base, precio_costo, perfiles_max, categoria, icono_color, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre de la plataforma es obligatorio.' });
  
  const logo_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO servicios (nombre, precio_base, precio_costo, perfiles_max, categoria, icono_color, logo_url, descripcion)
       VALUES ($1, COALESCE($2, 0), COALESCE($3, 0), COALESCE($4, 5), COALESCE($5, 'Streaming Video'), COALESCE($6, '#7C5CFF'), $7, $8)
       RETURNING *`,
      [nombre, precio_base, precio_costo, perfiles_max, categoria, icono_color, logo_url, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear plataforma:', err);
    res.status(500).json({ error: 'Error al crear la plataforma (puede que ya exista con ese nombre).' });
  }
}

// Actualizar plataforma existente
async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, precio_base, precio_costo, perfiles_max, categoria, icono_color, descripcion, activo } = req.body;
  
  const logo_url = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const result = await pool.query(
      `UPDATE servicios 
       SET nombre = COALESCE($1, nombre),
           precio_base = COALESCE($2, precio_base),
           precio_costo = COALESCE($3, precio_costo),
           perfiles_max = COALESCE($4, perfiles_max),
           categoria = COALESCE($5, categoria),
           icono_color = COALESCE($6, icono_color),
           descripcion = COALESCE($7, descripcion),
           activo = COALESCE($8, activo),
           logo_url = COALESCE($10, logo_url)
       WHERE id = $9
       RETURNING *`,
      [nombre, precio_base, precio_costo, perfiles_max, categoria, icono_color, descripcion, activo, id, logo_url]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plataforma no encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar plataforma:', err);
    res.status(500).json({ error: 'Error al actualizar la plataforma.' });
  }
}

// Eliminar plataforma
async function eliminar(req, res) {
  const { id } = req.params;
  try {
    const cuentaCheck = await pool.query('SELECT id FROM cuentas WHERE servicio_id = $1 LIMIT 1', [id]);
    if (cuentaCheck.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la plataforma porque tiene cuentas o perfiles asociados a clientes.' });
    }

    const result = await pool.query('DELETE FROM servicios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plataforma no encontrada.' });
    }
    res.json({ mensaje: 'Plataforma eliminada correctamente.' });
  } catch (err) {
    console.error('Error al eliminar plataforma:', err);
    res.status(500).json({ error: 'Error al eliminar la plataforma.' });
  }
}

// ==================== GESTIÓN DE CUENTAS MAESTRAS / CREDENCIALES ====================

// Listar todas las cuentas maestras o por servicio
async function listarCuentasMaestras(req, res) {
  try {
    const { servicio_id } = req.query;
    let query = `
      SELECT cm.*, s.nombre as servicio_nombre, s.icono_color, s.categoria as servicio_categoria, s.precio_base as servicio_precio
      FROM cuentas_maestras cm
      JOIN servicios s ON s.id = cm.servicio_id
    `;
    const params = [];

    if (servicio_id) {
      query += ` WHERE cm.servicio_id = $1`;
      params.push(servicio_id);
    }

    query += ` ORDER BY cm.fecha_creacion DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar cuentas maestras:', err);
    res.status(500).json({ error: 'Error al listar credenciales/cuentas maestras.' });
  }
}

// Crear nueva cuenta maestra (correo, contraseña, etc.)
async function crearCuentaMaestra(req, res) {
  const { servicio_id, correo, password, pin, perfiles_totales, perfiles_ocupados, fecha_renovacion, proveedor, costo, estado, notas } = req.body;

  if (!servicio_id || !correo || !password) {
    return res.status(400).json({ error: 'La plataforma, correo y contraseña son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cuentas_maestras (
        servicio_id, correo, password, pin, perfiles_totales, perfiles_ocupados,
        fecha_renovacion, proveedor, costo, estado, notas
      ) VALUES ($1, $2, $3, $4, COALESCE($5, 5), COALESCE($6, 0), $7, $8, COALESCE($9, 0), COALESCE($10, 'activa'), $11)
      RETURNING *`,
      [servicio_id, correo, password, pin || null, perfiles_totales, perfiles_ocupados, fecha_renovacion || null, proveedor || null, costo, estado, notas || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cuenta maestra:', err);
    res.status(500).json({ error: 'Error al registrar credenciales de la cuenta.' });
  }
}

// Actualizar credenciales de cuenta maestra
async function actualizarCuentaMaestra(req, res) {
  const { id } = req.params;
  const { servicio_id, correo, password, pin, perfiles_totales, perfiles_ocupados, fecha_renovacion, proveedor, costo, estado, notas } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cuentas_maestras SET
        servicio_id = COALESCE($1, servicio_id),
        correo = COALESCE($2, correo),
        password = COALESCE($3, password),
        pin = COALESCE($4, pin),
        perfiles_totales = COALESCE($5, perfiles_totales),
        perfiles_ocupados = COALESCE($6, perfiles_ocupados),
        fecha_renovacion = COALESCE($7, fecha_renovacion),
        proveedor = COALESCE($8, proveedor),
        costo = COALESCE($9, costo),
        estado = COALESCE($10, estado),
        notas = COALESCE($11, notas)
      WHERE id = $12
      RETURNING *`,
      [servicio_id, correo, password, pin, perfiles_totales, perfiles_ocupados, fecha_renovacion, proveedor, costo, estado, notas, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta maestra no encontrada.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cuenta maestra:', err);
    res.status(500).json({ error: 'Error al actualizar credenciales.' });
  }
}

// Eliminar cuenta maestra
async function eliminarCuentaMaestra(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cuentas_maestras WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta maestra no encontrada.' });
    }
    res.json({ mensaje: 'Cuenta maestra eliminada correctamente.' });
  } catch (err) {
    console.error('Error al eliminar cuenta maestra:', err);
    res.status(500).json({ error: 'Error al eliminar la cuenta maestra.' });
  }
}

// Obtener estadísticas avanzadas (Compras vs Ventas) por plataforma
async function obtenerEstadisticas(req, res) {
  const { id } = req.params;
  try {
    // 1. Obtener gastos (compras de cuentas maestras) agrupados por mes
    const comprasResult = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', fecha_creacion), 'YYYY-MM') as mes,
             SUM(costo) as total_compra
      FROM cuentas_maestras
      WHERE servicio_id = $1
      GROUP BY DATE_TRUNC('month', fecha_creacion)
      ORDER BY mes ASC
    `, [id]);

    // 2. Obtener ingresos (ventas - pagos registrados a clientes) agrupados por mes
    const ventasResult = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', p.fecha_pago), 'YYYY-MM') as mes,
             SUM(p.monto) as total_venta
      FROM pagos p
      JOIN cuentas c ON p.cuenta_id = c.id
      WHERE c.servicio_id = $1
      GROUP BY DATE_TRUNC('month', p.fecha_pago)
      ORDER BY mes ASC
    `, [id]);

    // 3. Totales globales
    const totalesResult = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(costo), 0) FROM cuentas_maestras WHERE servicio_id = $1) as compras_totales,
        (SELECT COALESCE(SUM(p.monto), 0) FROM pagos p JOIN cuentas c ON p.cuenta_id = c.id WHERE c.servicio_id = $1) as ventas_totales
    `, [id]);

    res.json({
      compras_por_mes: comprasResult.rows,
      ventas_por_mes: ventasResult.rows,
      totales: {
        compras: totalesResult.rows[0].compras_totales,
        ventas: totalesResult.rows[0].ventas_totales,
        balance: totalesResult.rows[0].ventas_totales - totalesResult.rows[0].compras_totales
      }
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  listarCuentasMaestras,
  crearCuentaMaestra,
  actualizarCuentaMaestra,
  eliminarCuentaMaestra,
  obtenerEstadisticas
};
