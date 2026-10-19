/*
  Manejo de subida de imagenes (comprobantes de pago).
  Para el MVP se guardan en el disco local (public/uploads).
  Cuando el proyecto crezca, se puede migrar facilmente a un bucket
  S3 (u otro almacenamiento) cambiando solo este archivo.
*/

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nombreUnico);
  }
});

function filtroImagenes(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();
  const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
  const extensionValida = tiposPermitidos.test(extension);
  const mimeValido = tiposPermitidos.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (extensionValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, webp, gif).'));
  }
}

const upload = multer({
  storage,
  fileFilter: filtroImagenes,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB maximo
});

function subirComprobante(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibio ninguna imagen.' });
  }
  const urlPublica = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: urlPublica });
}

module.exports = { upload, subirComprobante };
