const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/serviciosController');
const { upload } = require('../controllers/uploadController');

router.use(verificarToken);

// Cuentas maestras / credenciales (deben ir antes de las rutas con :id para evitar colisiones)
router.get('/cuentas-maestras/todas', controller.listarCuentasMaestras);
router.post('/cuentas-maestras', permitirRoles('super_admin', 'administrador', 'operador'), controller.crearCuentaMaestra);
router.put('/cuentas-maestras/:id', permitirRoles('super_admin', 'administrador', 'operador'), controller.actualizarCuentaMaestra);
router.delete('/cuentas-maestras/:id', permitirRoles('super_admin', 'administrador'), controller.eliminarCuentaMaestra);

// Plataformas / Catálogo de servicios
router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.get('/:id/estadisticas', controller.obtenerEstadisticas);
router.post('/', permitirRoles('super_admin', 'administrador'), upload.single('foto'), controller.crear);
router.put('/:id', permitirRoles('super_admin', 'administrador'), upload.single('foto'), controller.actualizar);
router.delete('/:id', permitirRoles('super_admin', 'administrador'), controller.eliminar);

module.exports = router;
