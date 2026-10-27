const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const v = require('../middlewares/validators/auth.validator');

const router = Router();

router.post('/register', v.registro, validate, controller.registrar);
router.post('/login', v.login, validate, controller.login);

module.exports = router;
