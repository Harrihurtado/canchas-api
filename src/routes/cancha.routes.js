const { Router } = require('express');
const controller = require('../controllers/cancha.controller');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const v = require('../middlewares/validators/cancha.validator');

const router = Router();

// Consultar el catálogo es público
router.get('/', v.listarCanchas, validate, controller.listar);
router.get('/:id', v.idParam, validate, controller.obtener);

// Modificar el catálogo solo lo puede hacer un admin
router.post('/', authenticate, authorize('admin'), v.crearCancha, validate, controller.crear);
router.put('/:id', authenticate, authorize('admin'), v.actualizarCancha, validate, controller.actualizar);
router.delete('/:id', authenticate, authorize('admin'), v.idParam, validate, controller.desactivar);

module.exports = router;
