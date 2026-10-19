const pool = require('../config/db');
const whatsappService = require('../services/whatsappService');

async function listar(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono, 
              s.nombre as servicio_nombre, s.icono_color,
              cm.correo as cuenta_maestra_correo, cm.password as cuenta_maestra_password, 
              COALESCE(c.pin, cm.pin) as pin_efectivo,
              (SELECT p.comprobante_imagen_url 
               FROM pagos p 
               WHERE p.cuenta_id = c.id AND p.comprobante_imagen_url IS NOT NULL 
               ORDER BY p.fecha_pago DESC, p.id DESC LIMIT 1) as comprobante_imagen_url,
              (SELECT p.monto 
               FROM pagos p 
               WHERE p.cuenta_id = c.id 
               ORDER BY p.fecha_pago DESC, p.id DESC LIMIT 1) as ultimo_monto
       FROM cuentas c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN servicios s ON s.id = c.servicio_id
       LEFT JOIN cuentas_maestras cm ON cm.id = c.cuenta_maestra_id
       ORDER BY c.fecha_vencimiento ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar cuentas.' });
  }
}

// Vista rapida usada en el panel: cuentas que vencen pronto o ya vencieron
async function porVencer(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono, 
              s.nombre as servicio_nombre, s.icono_color,
              cm.correo as cuenta_maestra_correo, cm.password as cuenta_maestra_password,
              COALESCE(c.pin, cm.pin) as pin_efectivo,
              (SELECT p.comprobante_imagen_url 
               FROM pagos p 
               WHERE p.cuenta_id = c.id AND p.comprobante_imagen_url IS NOT NULL 
               ORDER BY p.fecha_pago DESC, p.id DESC LIMIT 1) as comprobante_imagen_url
       FROM cuentas c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN servicios s ON s.id = c.servicio_id
       LEFT JOIN cuentas_maestras cm ON cm.id = c.cuenta_maestra_id
       WHERE c.fecha_vencimiento <= CURRENT_DATE + INTERVAL '3 days'
         AND c.estado != 'cancelada'
       ORDER BY c.fecha_vencimiento ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuentas por vencer.' });
  }
}

async function crear(req, res) {
  // Puede recibir un solo objeto o un array de suscripciones: { cliente_id, items: [...], comprobante_imagen_url } o un solo registro
  const { cliente_id, servicio_id, cuenta_maestra_id, tipo_perfil, pin, numero_perfil, fecha_compra, fecha_vencimiento, monto, comprobante_imagen_url, items } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Si viene en formato múltiple (items)
    if (Array.isArray(items) && items.length > 0) {
      if (!cliente_id) {
        throw new Error('El cliente es obligatorio.');
      }

      const creadas = [];
      for (const item of items) {
        if (!item.servicio_id || !item.fecha_compra || !item.fecha_vencimiento || item.monto === undefined) {
          throw new Error('Todos los items deben tener servicio, fechas y monto.');
        }

        const cuentaResult = await client.query(
          `INSERT INTO cuentas (cliente_id, servicio_id, cuenta_maestra_id, tipo_perfil, pin, numero_perfil, fecha_compra, fecha_vencimiento, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activa') RETURNING *`,
          [cliente_id, item.servicio_id, item.cuenta_maestra_id || null, item.tipo_perfil || null, item.pin || null, item.numero_perfil || null, item.fecha_compra, item.fecha_vencimiento]
        );

        const cuenta = cuentaResult.rows[0];

        await client.query(
          `INSERT INTO pagos (cuenta_id, monto, fecha_pago, tipo, comprobante_imagen_url)
           VALUES ($1, $2, $3, 'compra', $4)`,
          [cuenta.id, item.monto, item.fecha_compra, item.comprobante_imagen_url || comprobante_imagen_url || null]
        );

        if (item.cuenta_maestra_id) {
          await client.query(
            `UPDATE cuentas_maestras SET perfiles_ocupados = perfiles_ocupados + 1 WHERE id = $1`,
            [item.cuenta_maestra_id]
          );
        }

        creadas.push(cuenta);
      }

      await client.query('COMMIT');
      return res.status(201).json({ mensaje: `${creadas.length} cuentas registradas con éxito.`, cuentas: creadas });
    }

    // Registro individual
    if (!cliente_id || !servicio_id || !fecha_compra || !fecha_vencimiento || monto === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: cliente, servicio, fechas y monto.' });
    }

    const cuentaResult = await client.query(
      `INSERT INTO cuentas (cliente_id, servicio_id, cuenta_maestra_id, tipo_perfil, pin, numero_perfil, fecha_compra, fecha_vencimiento, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activa') RETURNING *`,
      [cliente_id, servicio_id, cuenta_maestra_id || null, tipo_perfil || null, pin || null, numero_perfil || null, fecha_compra, fecha_vencimiento]
    );

    const cuenta = cuentaResult.rows[0];

    await client.query(
      `INSERT INTO pagos (cuenta_id, monto, fecha_pago, tipo, comprobante_imagen_url)
       VALUES ($1, $2, $3, 'compra', $4)`,
      [cuenta.id, monto, fecha_compra, comprobante_imagen_url || null]
    );

    if (cuenta_maestra_id) {
      await client.query(
        `UPDATE cuentas_maestras SET perfiles_ocupados = perfiles_ocupados + 1 WHERE id = $1`,
        [cuenta_maestra_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(cuenta);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al crear la cuenta.' });
  } finally {
    client.release();
  }
}

async function actualizar(req, res) {
  const { id } = req.params;
  const { cliente_id, servicio_id, cuenta_maestra_id, tipo_perfil, pin, numero_perfil, fecha_compra, fecha_vencimiento, estado, monto, comprobante_imagen_url } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cuentaActual = await client.query('SELECT * FROM cuentas WHERE id = $1', [id]);
    if (cuentaActual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const prev = cuentaActual.rows[0];

    const result = await client.query(
      `UPDATE cuentas SET 
         cliente_id = COALESCE($1, cliente_id),
         servicio_id = COALESCE($2, servicio_id),
         cuenta_maestra_id = $3,
         tipo_perfil = COALESCE($4, tipo_perfil),
         pin = $5,
         numero_perfil = $6,
         fecha_compra = COALESCE($7, fecha_compra),
         fecha_vencimiento = COALESCE($8, fecha_vencimiento),
         estado = COALESCE($9, estado),
         fecha_actualizacion = NOW()
       WHERE id = $10 RETURNING *`,
      [cliente_id, servicio_id, cuenta_maestra_id !== undefined ? cuenta_maestra_id : prev.cuenta_maestra_id, tipo_perfil, pin, numero_perfil, fecha_compra, fecha_vencimiento, estado, id]
    );

    // Si cambió la cuenta maestra, actualizar contadores de slots
    if (cuenta_maestra_id !== undefined && cuenta_maestra_id !== prev.cuenta_maestra_id) {
      if (prev.cuenta_maestra_id) {
        await client.query('UPDATE cuentas_maestras SET perfiles_ocupados = GREATEST(perfiles_ocupados - 1, 0) WHERE id = $1', [prev.cuenta_maestra_id]);
      }
      if (cuenta_maestra_id) {
        await client.query('UPDATE cuentas_maestras SET perfiles_ocupados = perfiles_ocupados + 1 WHERE id = $1', [cuenta_maestra_id]);
      }
    }

    // Si se envió un nuevo comprobante o monto, actualizar el último pago
    if (comprobante_imagen_url || monto !== undefined) {
      const ultimoPago = await client.query('SELECT id FROM pagos WHERE cuenta_id = $1 ORDER BY id DESC LIMIT 1', [id]);
      if (ultimoPago.rows.length > 0) {
        await client.query(
          `UPDATE pagos SET 
             monto = COALESCE($1, monto),
             comprobante_imagen_url = COALESCE($2, comprobante_imagen_url)
           WHERE id = $3`,
          [monto !== undefined ? monto : null, comprobante_imagen_url || null, ultimoPago.rows[0].id]
        );
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la cuenta.' });
  } finally {
    client.release();
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cuenta = await client.query('SELECT * FROM cuentas WHERE id = $1', [id]);
    if (cuenta.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    if (cuenta.rows[0].cuenta_maestra_id) {
      await client.query('UPDATE cuentas_maestras SET perfiles_ocupados = GREATEST(perfiles_ocupados - 1, 0) WHERE id = $1', [cuenta.rows[0].cuenta_maestra_id]);
    }

    await client.query('DELETE FROM cuentas WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ mensaje: 'Cuenta eliminada correctamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la cuenta.' });
  } finally {
    client.release();
  }
}

// Registrar una renovacion: extiende la fecha de vencimiento y crea un nuevo pago
async function renovar(req, res) {
  const { nueva_fecha_vencimiento, monto, comprobante_imagen_url } = req.body;

  if (!nueva_fecha_vencimiento || !monto) {
    return res.status(400).json({ error: 'Se requiere la nueva fecha de vencimiento y el monto.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cuentaResult = await client.query(
      `UPDATE cuentas SET fecha_vencimiento = $1, estado = 'activa', fecha_actualizacion = NOW()
       WHERE id = $2 RETURNING *`,
      [nueva_fecha_vencimiento, req.params.id]
    );

    if (cuentaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    await client.query(
      `INSERT INTO pagos (cuenta_id, monto, fecha_pago, tipo, comprobante_imagen_url)
       VALUES ($1, $2, CURRENT_DATE, 'renovacion', $3)`,
      [req.params.id, monto, comprobante_imagen_url || null]
    );

    await client.query('COMMIT');
    res.json(cuentaResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al renovar la cuenta.' });
  } finally {
    client.release();
  }
}

// Cancelar/eliminar un perfil: dispara el aviso automatico de WhatsApp
async function cancelar(req, res) {
  try {
    const cuentaResult = await pool.query(
      `SELECT c.id, cl.id as cliente_id, cl.nombre as cliente_nombre, cl.telefono, s.nombre as servicio_nombre
       FROM cuentas c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN servicios s ON s.id = c.servicio_id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (cuentaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const cuenta = cuentaResult.rows[0];

    await pool.query("UPDATE cuentas SET estado = 'cancelada', fecha_actualizacion = NOW() WHERE id = $1", [cuenta.id]);

    await whatsappService.enviarMensaje({
      clienteId: cuenta.cliente_id,
      cuentaId: cuenta.id,
      tipoEvento: 'cancelacion',
      telefono: cuenta.telefono,
      variables: {
        nombre: cuenta.cliente_nombre,
        servicio: cuenta.servicio_nombre
      }
    });

    res.json({ mensaje: 'Cuenta cancelada y cliente notificado por WhatsApp.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cancelar la cuenta.' });
  }
}

module.exports = { listar, porVencer, crear, actualizar, eliminar, renovar, cancelar };
