const { Router } = require('express');
const controller = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const v = require('../middlewares/validators/user.validator');

const router = Router();

router.use(authenticate); // todas las rutas de usuarios requieren token

router.get('/me', controller.perfil);
router.put('/me', v.actualizarPerfil, validate, controller.actualizarPerfil);
router.get('/', authorize('admin'), controller.listar);

module.exports = router;
