const express = require('express');
const router = express.Router();
const metodosController = require('../controllers/metodosPagoController');
const verificarToken = require('../middleware/auth');
const verificarPermiso = require('../middleware/permisoCheck');

// Todos los usuarios autenticados pueden ver (para listarlos en dropdowns)
router.get('/', verificarToken, metodosController.listar);

// Solo admin/super_admin con permiso gestionar_sistema pueden agregar/editar/eliminar
router.post('/', verificarToken, verificarPermiso('gestionar_sistema'), metodosController.crear);
router.put('/:id', verificarToken, verificarPermiso('gestionar_sistema'), metodosController.actualizar);
router.delete('/:id', verificarToken, verificarPermiso('gestionar_sistema'), metodosController.eliminar);

module.exports = router;
