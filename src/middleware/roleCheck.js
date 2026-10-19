/*
  Middleware para restringir rutas por rol.
  Uso: permitirRoles('super_admin', 'operador')
*/
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta accion.' });
    }
    next();
  };
}

module.exports = permitirRoles;
