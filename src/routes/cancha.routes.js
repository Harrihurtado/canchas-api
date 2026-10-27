const { Router } = require('express');
const controller = require('../controllers/cancha.controller');
const validate = require('../middlewares/validate');
const v = require('../middlewares/validators/cancha.validator');

const router = Router();

router.get('/', v.listarCanchas, validate, controller.listar);
router.get('/:id', v.idParam, validate, controller.obtener);
router.post('/', v.crearCancha, validate, controller.crear);
router.put('/:id', v.actualizarCancha, validate, controller.actualizar);
router.delete('/:id', v.idParam, validate, controller.desactivar);

module.exports = router;
