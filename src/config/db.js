require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

let esquemaAsegurado = false;

async function asegurarEsquema() {
  if (esquemaAsegurado) return;
  esquemaAsegurado = true;

  try {
    await pool.query(`
      ALTER TABLE servicios 
      ADD COLUMN IF NOT EXISTS precio_base DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS perfiles_max INTEGER NOT NULL DEFAULT 5,
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) NOT NULL DEFAULT 'Streaming Video',
      ADD COLUMN IF NOT EXISTS icono_color VARCHAR(50) NOT NULL DEFAULT '#7C5CFF',
      ADD COLUMN IF NOT EXISTS descripcion TEXT,
      ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

      CREATE TABLE IF NOT EXISTS cuentas_maestras (
        id SERIAL PRIMARY KEY,
        servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
        correo VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        pin VARCHAR(50),
        perfiles_totales INTEGER NOT NULL DEFAULT 5,
        perfiles_ocupados INTEGER NOT NULL DEFAULT 0,
        fecha_renovacion DATE,
        proveedor VARCHAR(150),
        costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'caida', 'en_revision', 'vencida')),
        notas TEXT,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE cuentas
      ADD COLUMN IF NOT EXISTS cuenta_maestra_id INTEGER REFERENCES cuentas_maestras(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS pin VARCHAR(50),
      ADD COLUMN IF NOT EXISTS numero_perfil VARCHAR(50);
    `);
  } catch (err) {
    // Si la tabla ya existe o está en uso, continuar
  }
}

asegurarEsquema();

module.exports = pool;
