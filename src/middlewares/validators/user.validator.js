const { body } = require('express-validator');

const actualizarPerfil = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('telefono').optional().matches(/^\d{7,10}$/).withMessage('El teléfono debe tener entre 7 y 10 dígitos'),
];

module.exports = { actualizarPerfil };
