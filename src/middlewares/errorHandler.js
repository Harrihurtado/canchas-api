const config = require('../config/env');

// Middleware global: TODOS los errores terminan aquí con el mismo formato
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Valor inválido para el campo ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
    details = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
    details = err.keyValue;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  }

  if (statusCode === 500) console.error(err);

  const body = { success: false, message };
  if (details) body.details = details;
  // El stack solo se muestra en desarrollo, nunca en producción
  if (statusCode === 500 && config.nodeEnv === 'development') body.stack = err.stack;

  res.status(statusCode).json(body);
};
