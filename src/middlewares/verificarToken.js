const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ codigo: 401, estado: 'token no proporcionado', datos: null });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ codigo: 401, estado: 'token inválido o vencido', datos: null });
  }
}

module.exports = verificarToken;
