require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const clientesRoutes = require('./src/routes/clientesRoutes');
const cuentasRoutes = require('./src/routes/cuentasRoutes');
const incidenciasRoutes = require('./src/routes/incidenciasRoutes');
const serviciosRoutes = require('./src/routes/serviciosRoutes');
const mensajesRoutes = require('./src/routes/mensajesRoutes');
const metricsRoutes = require('./src/routes/metricsRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const plantillasRoutes = require('./src/routes/plantillasRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const rolesRoutes = require('./src/routes/rolesRoutes');
const metodosPagoRoutes = require('./src/routes/metodosPagoRoutes');

const { iniciarTareasProgramadas } = require('./src/services/schedulerService');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/metricas', metricsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/plantillas', plantillasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);

// Manejo de rutas no encontradas bajo /api
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada.' });
});

// Manejador global de errores para la API
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });
});

// Sirve el panel administrativo (SPA simple)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  iniciarTareasProgramadas();
});
