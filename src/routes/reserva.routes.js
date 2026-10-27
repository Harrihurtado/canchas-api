const { Router } = require('express');
const controller = require('../controllers/reserva.controller');
const validate = require('../middlewares/validate');
const v = require('../middlewares/validators/reserva.validator');

const router = Router();

router.get('/', v.listarReservas, validate, controller.listar);
router.post('/', v.crearReserva, validate, controller.crear);
router.patch('/:id/cancelar', v.idParam, validate, controller.cancelar);

module.exports = router;
