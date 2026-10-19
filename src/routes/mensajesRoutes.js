const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/mensajesController');

router.use(verificarToken);

router.get('/', controller.listar);
router.post('/:id/reenviar', permitirRoles('super_admin', 'operador'), controller.reenviar);
router.post('/:id/respuesta', controller.registrarRespuesta); // usado por webhook de Meta en produccion
router.get('/notificaciones/pendientes', controller.notificacionesPendientes);
router.put('/notificaciones/:id/leida', controller.marcarLeida);

module.exports = router;
