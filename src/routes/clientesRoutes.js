const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/clientesController');

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', permitirRoles('super_admin', 'operador', 'administrador'), controller.crear);
router.put('/:id', permitirRoles('super_admin', 'operador', 'administrador'), controller.actualizar);
router.delete('/:id', permitirRoles('super_admin', 'operador'), controller.eliminar);

module.exports = router;
