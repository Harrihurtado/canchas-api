const { Router } = require('express');
const controller = require('../controllers/reserva.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const v = require('../middlewares/validators/reserva.validator');

const router = Router();

router.use(authenticate); // todas las rutas de reservas requieren token

router.get('/', v.listarReservas, validate, controller.listar);
router.post('/', v.crearReserva, validate, controller.crear);
router.patch('/:id/cancelar', v.idParam, validate, controller.cancelar);

module.exports = router;
