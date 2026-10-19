const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/incidenciasController');

router.use(verificarToken);

router.get('/', controller.listar);
router.post('/', permitirRoles('super_admin', 'operador', 'administrador'), controller.crear);
router.put('/:id', permitirRoles('super_admin', 'operador', 'administrador'), controller.actualizar);

module.exports = router;
