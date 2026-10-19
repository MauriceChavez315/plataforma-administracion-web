const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const { upload, subirComprobante } = require('../controllers/uploadController');

router.use(verificarToken);

router.post('/comprobante', (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al procesar el archivo.' });
    }
    subirComprobante(req, res);
  });
});

module.exports = router;
