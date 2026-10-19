/*
  Este script:
  1. Ejecuta el archivo db/esquema_base_datos.sql contra tu base de datos.
  2. Crea el usuario Super Admin inicial usando los datos del .env.

  Uso: npm run db:setup
  Requisito: ya debes haber creado la base de datos vacia en PostgreSQL
  (ej. con: createdb gestion_cuentas)
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function setup() {
  try {
    const sqlPath = path.join(__dirname, '..', '..', 'db', 'esquema_base_datos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando esquema de base de datos...');
    await pool.query(sql);
    console.log('Esquema creado correctamente.');

    // Insertar permisos básicos
    const permisos = [
      ['ver_dashboard', 'Acceso al Dashboard Principal'],
      ['ver_plataformas', 'Acceso a Estadísticas de Plataformas'],
      ['gestionar_cuentas', 'Crear y editar Cuentas'],
      ['gestionar_clientes', 'Crear y editar Clientes'],
      ['gestionar_incidencias', 'Gestionar Incidencias'],
      ['ver_mensajes', 'Ver historial de Mensajes'],
      ['gestionar_sistema', 'Acceso completo a configuración, roles y usuarios']
    ];

    for (const [codigo, desc] of permisos) {
      await pool.query(
        'INSERT INTO permisos (codigo, descripcion) VALUES ($1, $2) ON CONFLICT (codigo) DO NOTHING',
        [codigo, desc]
      );
    }

    // Insertar rol super_admin (si no existe)
    let rolId;
    const rolResult = await pool.query("SELECT id FROM roles WHERE nombre = 'super_admin'");
    if (rolResult.rows.length === 0) {
      const nuevoRol = await pool.query(
        "INSERT INTO roles (nombre, es_fijo) VALUES ('super_admin', true) RETURNING id"
      );
      rolId = nuevoRol.rows[0].id;
    } else {
      rolId = rolResult.rows[0].id;
    }

    // Vincular todos los permisos al rol super_admin
    const todosPermisos = await pool.query('SELECT id FROM permisos');
    for (const p of todosPermisos.rows) {
      await pool.query(
        'INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [rolId, p.id]
      );
    }

    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      console.log('No se definio SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD en .env, se omite creacion de usuario inicial.');
      process.exit(0);
    }

    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      console.log('El usuario Super Admin ya existe, no se crea de nuevo.');
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES ($1, $2, $3, $4)',
      ['Super Admin', email, hash, rolId]
    );

    console.log(`Usuario Super Admin creado: ${email}`);
    console.log('Ya puedes iniciar sesion en el panel con ese correo y la contraseña que definiste en .env');
    process.exit(0);
  } catch (err) {
    console.error('Error al configurar la base de datos:', err.message);
    process.exit(1);
  }
}

setup();
