-- ============================================================
-- Esquema de base de datos
-- Plataforma administrativa de gestión de cuentas + bot WhatsApp
-- Motor sugerido: PostgreSQL (ajustar tipos si se usa MySQL)
-- ============================================================

-- 0. Roles y Permisos (Sistema Dinámico)
DROP TABLE IF EXISTS rol_permisos CASCADE;
DROP TABLE IF EXISTS permisos CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    es_fijo BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS permisos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id INTEGER REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- 1. Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20),                -- usado para enviarle el resumen por WhatsApp
    rol_id          INTEGER NOT NULL REFERENCES roles(id),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Clientes (compradores de cuentas)
CREATE TABLE IF NOT EXISTS clientes (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(20) NOT NULL,
    notas           TEXT,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Catálogo de servicios / plataformas (Netflix, Disney+, HBO, etc.)
CREATE TABLE IF NOT EXISTS servicios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(80) UNIQUE NOT NULL,
    precio_base     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    precio_costo    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    perfiles_max    INTEGER NOT NULL DEFAULT 5,
    categoria       VARCHAR(50) NOT NULL DEFAULT 'Streaming Video',
    icono_color     VARCHAR(50) NOT NULL DEFAULT '#7C5CFF',
    logo_url        VARCHAR(500),
    descripcion     TEXT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3.1 Cuentas maestras / credenciales de proveedores
CREATE TABLE IF NOT EXISTS cuentas_maestras (
    id                  SERIAL PRIMARY KEY,
    servicio_id         INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    correo              VARCHAR(255) NOT NULL,
    password            VARCHAR(255) NOT NULL,
    pin                 VARCHAR(50),
    perfiles_totales    INTEGER NOT NULL DEFAULT 5,
    perfiles_ocupados   INTEGER NOT NULL DEFAULT 0,
    fecha_renovacion    DATE,
    proveedor           VARCHAR(150),
    costo               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado              VARCHAR(20) NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa', 'caida', 'en_revision', 'vencida')),
    notas               TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Cuentas / perfiles vendidos a clientes
CREATE TABLE IF NOT EXISTS cuentas (
    id                  SERIAL PRIMARY KEY,
    cliente_id          INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    servicio_id         INTEGER NOT NULL REFERENCES servicios(id),
    cuenta_maestra_id   INTEGER REFERENCES cuentas_maestras(id) ON DELETE SET NULL,
    tipo_perfil         VARCHAR(50),               -- ej. 'completo', 'perfil individual'
    pin                 VARCHAR(50),
    numero_perfil       VARCHAR(50),
    fecha_compra        DATE NOT NULL,
    fecha_vencimiento   DATE NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa', 'por_vencer', 'vencida', 'cancelada')),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuentas_vencimiento ON cuentas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cuentas_estado ON cuentas(estado);

-- 5. Métodos de Pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Pagos (historial de compras y renovaciones por cuenta)
CREATE TABLE IF NOT EXISTS pagos (
    id                      SERIAL PRIMARY KEY,
    cuenta_id               INTEGER NOT NULL REFERENCES cuentas(id) ON DELETE CASCADE,
    monto                   DECIMAL(10,2) NOT NULL,
    fecha_pago              DATE NOT NULL,
    tipo                    VARCHAR(20) NOT NULL CHECK (tipo IN ('compra', 'renovacion')),
    comprobante_imagen_url  VARCHAR(500),
    metodo_pago_id          INTEGER REFERENCES metodos_pago(id) ON DELETE SET NULL,
    fecha_registro          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- 6. Incidencias reportadas sobre una cuenta
CREATE TABLE IF NOT EXISTS incidencias (
    id                  SERIAL PRIMARY KEY,
    cuenta_id           INTEGER NOT NULL REFERENCES cuentas(id) ON DELETE CASCADE,
    descripcion         TEXT NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'abierta'
                        CHECK (estado IN ('abierta', 'en_proceso', 'resuelta')),
    notas_resolucion    TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_resolucion    TIMESTAMP
);

-- 7. Plantillas de mensajes de WhatsApp (editables desde el panel)
CREATE TABLE IF NOT EXISTS plantillas_mensajes (
    id              SERIAL PRIMARY KEY,
    tipo_evento     VARCHAR(30) UNIQUE NOT NULL
                    CHECK (tipo_evento IN ('aviso_previo', 'vencimiento', 'cancelacion', 'resumen_admin')),
    contenido       TEXT NOT NULL,
    activa          BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. Mensajes enviados (log de comunicación por WhatsApp)
CREATE TABLE IF NOT EXISTS mensajes_enviados (
    id                  SERIAL PRIMARY KEY,
    cliente_id          INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cuenta_id           INTEGER REFERENCES cuentas(id) ON DELETE SET NULL,
    tipo_evento         VARCHAR(30) NOT NULL,
    contenido_enviado   TEXT NOT NULL,
    fecha_envio         TIMESTAMP NOT NULL DEFAULT NOW(),
    estado_envio        VARCHAR(20) NOT NULL DEFAULT 'enviado'
                        CHECK (estado_envio IN ('enviado', 'fallido', 'pendiente')),
    respuesta_cliente   TEXT,
    fecha_respuesta     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensajes_cliente ON mensajes_enviados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes_enviados(fecha_envio);

-- 9. Notificaciones internas (aviso al Operador cuando un cliente responde)
CREATE TABLE IF NOT EXISTS notificaciones_internas (
    id              SERIAL PRIMARY KEY,
    operador_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje_id      INTEGER NOT NULL REFERENCES mensajes_enviados(id) ON DELETE CASCADE,
    leido           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Configuración general del sistema (clave-valor)
CREATE TABLE IF NOT EXISTS configuracion (
    clave   VARCHAR(50) PRIMARY KEY,
    valor   VARCHAR(255) NOT NULL
);

-- Valores iniciales de configuración sugeridos
INSERT INTO configuracion (clave, valor) VALUES
    ('dias_aviso_previo', '3'),
    ('frecuencia_resumen_admin', 'semanal')
ON CONFLICT DO NOTHING;

-- Servicios iniciales sugeridos (ajustar según catálogo real)
INSERT INTO servicios (nombre) VALUES
    ('Netflix'),
    ('Disney+'),
    ('HBO Max'),
    ('Amazon Prime Video')
ON CONFLICT DO NOTHING;

-- Plantillas de mensaje iniciales (contenido editable luego desde el panel)
INSERT INTO plantillas_mensajes (tipo_evento, contenido) VALUES
    ('aviso_previo', 'Hola {{nombre}}. Tu cuenta de {{servicio}} vence el {{fecha_vencimiento}}. ¿Deseas renovarla? Responde SÍ y te ayudamos.'),
    ('vencimiento', 'Hola {{nombre}}, tu cuenta de {{servicio}} venció hoy. Si deseas renovarla, respóndenos y la reactivamos enseguida.'),
    ('cancelacion', 'Hola {{nombre}}, tu perfil de {{servicio}} fue dado de baja. Si fue un error o deseas reactivarlo, contáctanos.'),
    ('resumen_admin', 'Resumen {{periodo}}: Ingresos {{monto_actual}} (vs {{monto_anterior}} anterior). Cuentas activas: {{activas}}. Vencidas: {{vencidas}}. Incidencias abiertas: {{incidencias}}.')
ON CONFLICT DO NOTHING;

-- Métodos de pago iniciales sugeridos
INSERT INTO metodos_pago (nombre) VALUES
    ('Efectivo'),
    ('PayPal'),
    ('Binance'),
    ('Transferencia Bancaria')
ON CONFLICT DO NOTHING;
