const { body } = require('express-validator');

const registro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('El email no es válido').toLowerCase(),
  body('password').isString().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('telefono').optional().matches(/^\d{7,10}$/).withMessage('El teléfono debe tener entre 7 y 10 dígitos'),
];

const login = [
  body('email').trim().isEmail().withMessage('El email no es válido').toLowerCase(),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { registro, login };
