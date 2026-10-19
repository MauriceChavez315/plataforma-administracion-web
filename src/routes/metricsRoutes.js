const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const permitirRoles = require('../middleware/roleCheck');
const controller = require('../controllers/metricsController');

router.use(verificarToken);

router.get('/resumen', permitirRoles('super_admin', 'administrador'), controller.resumen);

module.exports = router;
