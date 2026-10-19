const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const verificarToken = require('../middleware/auth');
const verificarPermiso = require('../middleware/permisoCheck');

router.use(verificarToken, verificarPermiso('gestionar_sistema'));

router.get('/permisos', rolesController.listarPermisos);
router.get('/', rolesController.listarRoles);
router.post('/', rolesController.crearRol);
router.put('/:id', rolesController.actualizarRol);
router.delete('/:id', rolesController.eliminarRol);

module.exports = router;
