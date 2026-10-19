<div align="center">

# 🚀 Plataforma de Administración Web & Gestión de Cuentas

**Solución integral y profesional para la administración de clientes, perfiles de streaming, pagos y notificaciones automatizadas por WhatsApp.**

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![WhatsApp Cloud API](https://img.shields.io/badge/WhatsApp-Cloud%20API-25d366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://business.facebook.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Descripción General

**Plataforma de Administración Web** es un sistema CRM y ERP diseñado específicamente para negocios de distribución y venta de cuentas/perfiles digitales (Netflix, Disney+, Spotify, HBO Max, Prime Video, etc.). 

El sistema centraliza el control de inventario de cuentas maestras, asignación de perfiles individuales a clientes, seguimiento de cobros con comprobantes, y automatiza la comunicación con los usuarios mediante un bot integrado con la **API oficial de WhatsApp Cloud de Meta**.

---

## ✨ Características Principales

| Módulo | Descripción |
| :--- | :--- |
| 👥 **Gestión de Clientes** | Directorio centralizado de clientes con número telefónico, historial de compras, suscripciones activas y notas. |
| 📺 **Cuentas Maestras y Perfiles** | Control de stock de cuentas proveedores, credenciales, pines de acceso, perfiles totales vs ocupados y fechas de renovación. |
| 💳 **Pagos y Comprobantes** | Registro de transacciones con soporte para carga de comprobantes (`jpg`, `png`, `gif`), métodos de pago configurables y estados de validación. |
| 🤖 **Bot de WhatsApp** | Envío de notificaciones automáticas programadas (recordatorios de cobro, avisos de vencimiento, confirmación de pagos y reportes administrativos). Cuenta con modo **simulado** (desarrollo) y **real** (Meta Cloud API). |
| 📊 **Dashboard y Métricas** | Estadísticas financieras en tiempo real, ingresos mensuales, comparativas contra periodos anteriores y selector multi-moneda (**USD**, **MXN**, **PEN**). |
| 🛡️ **Seguridad y Roles (RBAC)** | Autenticación robusta basada en JWT y encriptación Bcrypt, con control granular de permisos por módulo (Super Admin, Administrador, Operador/Soporte). |
| 💬 **Plantillas Personalizables** | Editor de plantillas para mensajes automáticos con variables dinámicas (`{{nombre}}`, `{{servicio}}`, `{{fecha_vencimiento}}`). |
| ⏱️ **Cron Jobs Automáticos** | Tareas programadas con `node-cron` que evalúan diariamente los estados de cuenta y disparan alertas oportunas. |

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express.js (REST API modular)
- **Base de Datos:** PostgreSQL con pool de conexiones (`pg`)
- **Autenticación:** JSON Web Tokens (JWT) & Bcrypt
- **Automatización:** Node-cron para tareas periódicas
- **Frontend:** Single Page Application (Vanilla JavaScript moderno, HTML5 semántico, CSS3 con variables y diseño responsivo)
- **Carga de Archivos:** Multer para subida segura de comprobantes
- **Integraciones:** Meta WhatsApp Cloud API (Graph API)

---

## 📂 Arquitectura del Proyecto

```plaintext
plataforma-administracion-web/
├── db/
│   └── esquema_base_datos.sql      # Script DDL completo de PostgreSQL
├── public/
│   ├── css/
│   │   └── style.css               # Estilos globales y diseño responsivo
│   ├── js/
│   │   ├── api.js                  # Capa de cliente HTTP y autenticación
│   │   └── app.js                  # Controladores de vista SPA y reactividad
│   ├── uploads/                    # Comprobantes de pago (excluido de git)
│   └── index.html                  # Plantilla principal del panel
├── src/
│   ├── config/
│   │   └── db.js                   # Conexión y pool de PostgreSQL
│   ├── controllers/                # Lógica de negocio por módulo
│   ├── middleware/                 # Verificación de JWT y roles (RBAC)
│   ├── routes/                     # Definición de endpoints REST
│   ├── services/
│   │   ├── metricsService.js       # Cálculo de KPIs e ingresos
│   │   ├── schedulerService.js     # Cron jobs para avisos automáticos
│   │   └── whatsappService.js      # Integración Meta Cloud API / Modo Simulado
│   └── utils/
│       └── setupDb.js              # Script de inicialización de BD y SuperAdmin
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore                      # Exclusión de archivos sensibles y temporales
├── package.json                    # Dependencias y scripts de ejecución
├── server.js                       # Entrada principal de la aplicación
└── LICENSE                         # Licencia MIT
```

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) v18.0.0 o superior
- [PostgreSQL](https://www.postgresql.org/) v14 o superior
- Gestor de paquetes `npm` (incluido con Node.js)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MauriceChavez315/plataforma-administracion-web.git
cd plataforma-administracion-web
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables con tus datos:

```bash
cp .env.example .env
```

Configura tus credenciales en `.env`:

```env
# Conexión PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_cuentas
DB_USER=postgres
DB_PASSWORD=tu_password

# Servidor
PORT=3000

# Seguridad
JWT_SECRET=super_secret_jwt_key_random_string

# WhatsApp (Simulado o Real)
WHATSAPP_MODE=simulado
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Credenciales iniciales del Super Administrador
SUPERADMIN_EMAIL=admin@tuempresa.com
SUPERADMIN_PASSWORD=ContraseñaSegura123!
```

### 4. Inicializar la Base de Datos

Crea la base de datos en PostgreSQL si aún no existe:

```bash
createdb -U postgres gestion_cuentas
```

Ejecuta el script de migración para construir las tablas y crear el usuario Super Admin:

```bash
npm run db:setup
```

### 5. Iniciar la Aplicación

Modo desarrollo (con recarga automática):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

Visita `http://localhost:3000` en tu navegador e inicia sesión con las credenciales definidas en `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD`.

---

## 🤖 Integración con WhatsApp Cloud API

El sistema soporta dos modos de operación configurables mediante la variable `WHATSAPP_MODE`:

1. **Modo Simulado (`WHATSAPP_MODE=simulado`):**
   - Ideal para desarrollo local o entornos de prueba sin costo.
   - Los mensajes generados se imprimen en la consola del servidor y se registran en la base de datos de mensajes para auditoría.

2. **Modo Real (`WHATSAPP_MODE=real`):**
   - Utiliza la **Meta Cloud API** oficial.
   - Requiere crear una App en [Meta for Developers](https://developers.facebook.com/) y obtener:
     - `WHATSAPP_TOKEN`: Token de acceso permanente de sistema.
     - `WHATSAPP_PHONE_NUMBER_ID`: Identificador del número remitente registrado.
   - Envío directo a los números telefónicos en formato internacional (E.164).

---

## 🔐 Matriz de Permisos y Roles (RBAC)

El sistema incluye control de acceso basado en roles:

| Funcionalidad | Super Admin | Administrador | Operador / Soporte |
| :--- | :---: | :---: | :---: |
| Dashboard y Métricas Financieras | ✅ | ✅ | ❌ |
| Gestión de Clientes | ✅ | ✅ | ✅ |
| Cuentas Maestras y Perfiles | ✅ | ✅ | ✅ |
| Registro de Pagos y Comprobantes | ✅ | ✅ | ✅ |
| Configuración de Roles y Permisos | ✅ | ❌ | ❌ |
| Gestión de Usuarios | ✅ | ❌ | ❌ |
| Plantillas de WhatsApp | ✅ | ✅ | ❌ |
| Recepción de Resumen Diario | ✅ | ✅ | ❌ |

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Realiza un Fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`).
3. Confirma tus cambios (`git commit -m 'feat: Agrega nueva funcionalidad'`).
4. Sube la rama (`git push origin feature/NuevaFuncionalidad`).
5. Abre un Pull Request describiendo tus modificaciones.

---

## 📄 Licencia

Este proyecto se encuentra bajo la Licencia [MIT](LICENSE).

---

<div align="center">
Desarrollado con ❤️ por <b>Maurice Chavez</b>
</div>
