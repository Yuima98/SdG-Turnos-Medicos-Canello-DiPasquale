function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ codigo: 403, estado: 'no tiene permisos para acceder a este recurso', datos: null });
    }
    next();
  };
}

module.exports = verificarRol;
