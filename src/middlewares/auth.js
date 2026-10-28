const AppError = require('../utils/AppError');
const { verificarToken } = require('../utils/jwt');
const User = require('../models/user.model');

// Portero: exige "Authorization: Bearer <token>" válido y deja el usuario en req.user
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new AppError('No autenticado: falta el token', 401));
  }

  let payload;
  try {
    payload = verificarToken(token);
  } catch {
    return next(new AppError('Token inválido o expirado', 401));
  }

  // Si el usuario fue eliminado después de emitir el token, se rechaza
  const existe = await User.exists({ _id: payload.id });
  if (!existe) return next(new AppError('El usuario del token ya no existe', 401));

  req.user = { id: payload.id, rol: payload.rol };
  next();
};

// Control de acceso por rol: authorize('admin')
const authorize = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return next(new AppError('No tienes permisos para realizar esta acción', 403));
  }
  next();
};

module.exports = { authenticate, authorize };
