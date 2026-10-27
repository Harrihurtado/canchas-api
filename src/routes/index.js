const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const canchaRoutes = require('./cancha.routes');
const reservaRoutes = require('./reserva.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API CanchaYa funcionando' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/canchas', canchaRoutes);
router.use('/reservas', reservaRoutes);

module.exports = router;
