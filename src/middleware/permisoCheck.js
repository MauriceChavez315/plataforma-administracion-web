/*
  Middleware para restringir rutas basadas en permisos específicos.
  Uso: verificarPermiso('gestionar_sistema')
*/
function verificarPermiso(permisoRequerido) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    // El super_admin siempre tiene acceso a todo por diseño de seguridad,
    // o podemos simplemente confiar en los permisos del token.
    if (req.usuario.rol === 'super_admin') {
      return next();
    }

    const permisosDelUsuario = req.usuario.permisos || [];
    if (!permisosDelUsuario.includes(permisoRequerido)) {
      return res.status(403).json({ error: 'Acceso denegado: falta el permiso requerido (' + permisoRequerido + ').' });
    }
    
    next();
  };
}

module.exports = verificarPermiso;
