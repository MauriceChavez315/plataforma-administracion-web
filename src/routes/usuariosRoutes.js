const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/usuariosController');

router.use(verificarToken);
router.use(permitirRoles('super_admin')); // Gestion de roles: exclusivo Super Admin

router.get('/', controller.listar);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);

module.exports = router;
