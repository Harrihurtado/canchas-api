const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Se ejecuta después de las reglas de express-validator y corta la petición si hay errores
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ campo: e.path, mensaje: e.msg }));
    return next(new AppError('Datos inválidos', 400, details));
  }
  next();
};
