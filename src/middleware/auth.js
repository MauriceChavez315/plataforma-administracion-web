const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No se proporciono un token de acceso.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido o expirado.' });
    }
    req.usuario = usuario;
    next();
  });
}

module.exports = verificarToken;
