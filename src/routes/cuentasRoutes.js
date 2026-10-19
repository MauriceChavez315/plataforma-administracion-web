const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/cuentasController');

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/por-vencer', controller.porVencer);
router.post('/', permitirRoles('super_admin', 'operador', 'administrador'), controller.crear);
router.put('/:id', permitirRoles('super_admin', 'operador', 'administrador'), controller.actualizar);
router.delete('/:id', permitirRoles('super_admin', 'administrador'), controller.eliminar);
router.post('/:id/renovar', permitirRoles('super_admin', 'operador', 'administrador'), controller.renovar);
router.post('/:id/cancelar', permitirRoles('super_admin', 'operador', 'administrador'), controller.cancelar);

module.exports = router;
