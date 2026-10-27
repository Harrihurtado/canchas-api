const { body, param, query } = require('express-validator');
const { DEPORTES, SUPERFICIES } = require('../../utils/constants');

const idParam = [param('id').isMongoId().withMessage('El id no es un ObjectId válido')];

const reglasCancha = (opcional) => {
  const campo = (nombre) => (opcional ? body(nombre).optional() : body(nombre));
  return [
    campo('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    campo('deporte').isIn(DEPORTES).withMessage(`Deporte inválido. Opciones: ${DEPORTES.join(', ')}`),
    body('superficie').optional().isIn(SUPERFICIES).withMessage(`Superficie inválida. Opciones: ${SUPERFICIES.join(', ')}`),
    campo('precioHora').isFloat({ min: 0 }).withMessage('precioHora debe ser un número mayor o igual a 0').toFloat(),
    campo('capacidad').isInt({ min: 2 }).withMessage('capacidad debe ser un entero mayor o igual a 2').toInt(),
    campo('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria'),
  ];
};

const crearCancha = reglasCancha(false);
const actualizarCancha = [...idParam, ...reglasCancha(true)];
const listarCanchas = [
  query('deporte').optional().isIn(DEPORTES).withMessage(`Deporte inválido. Opciones: ${DEPORTES.join(', ')}`),
];

module.exports = { idParam, crearCancha, actualizarCancha, listarCanchas };
