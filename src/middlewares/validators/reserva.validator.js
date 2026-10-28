const { body, param, query } = require('express-validator');
const { ESTADOS_RESERVA, HORA_REGEX } = require('../../utils/constants');

const idParam = [param('id').isMongoId().withMessage('El id no es un ObjectId válido')];

// El usuario ya no viene en el body: se toma del token (req.user)
const crearReserva = [
  body('cancha').isMongoId().withMessage('cancha debe ser un ObjectId válido'),
  body('fecha').isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('fecha debe tener formato YYYY-MM-DD'),
  body('horaInicio').matches(HORA_REGEX).withMessage('horaInicio debe tener formato HH:mm'),
  body('horaFin').matches(HORA_REGEX).withMessage('horaFin debe tener formato HH:mm'),
];

const listarReservas = [
  query('usuario').optional().isMongoId().withMessage('usuario debe ser un ObjectId válido'),
  query('cancha').optional().isMongoId().withMessage('cancha debe ser un ObjectId válido'),
  query('estado').optional().isIn(ESTADOS_RESERVA).withMessage(`Estado inválido. Opciones: ${ESTADOS_RESERVA.join(', ')}`),
];

module.exports = { idParam, crearReserva, listarReservas };
