const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/plantillasController');

router.use(verificarToken);

router.get('/', controller.listar);
router.put('/:id', permitirRoles('super_admin'), controller.actualizar);

module.exports = router;
