const Reserva = require('../models/reserva.model');
const Cancha = require('../models/cancha.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { horaAMinutos, calcularHoras } = require('../utils/time');

// Regla de negocio: dos reservas se cruzan si (inicioA < finB) y (inicioB < finA).
// Como las horas son "HH:mm" con ceros a la izquierda, se pueden comparar como texto.
const verificarDisponibilidad = async (canchaId, fecha, horaInicio, horaFin) => {
  const cruce = await Reserva.findOne({
    cancha: canchaId,
    fecha,
    estado: { $ne: 'cancelada' },
    horaInicio: { $lt: horaFin },
    horaFin: { $gt: horaInicio },
  });
  if (cruce) {
    throw new AppError(
      `La cancha ya está reservada de ${cruce.horaInicio} a ${cruce.horaFin} en esa fecha`,
      409
    );
  }
};

const crear = async ({ usuario, cancha: canchaId, fecha, horaInicio, horaFin }) => {
  if (horaAMinutos(horaFin) <= horaAMinutos(horaInicio)) {
    throw new AppError('La hora de fin debe ser mayor que la hora de inicio', 400);
  }

  const user = await User.findById(usuario);
  if (!user) throw new AppError('Usuario no encontrado', 404);

  const cancha = await Cancha.findById(canchaId);
  if (!cancha || !cancha.activa) throw new AppError('Cancha no encontrada o inactiva', 404);

  const fechaReserva = new Date(fecha); // "2026-11-01" -> medianoche UTC
  await verificarDisponibilidad(canchaId, fechaReserva, horaInicio, horaFin);

  const total = Math.round(calcularHoras(horaInicio, horaFin) * cancha.precioHora);

  return Reserva.create({
    usuario,
    cancha: canchaId,
    fecha: fechaReserva,
    horaInicio,
    horaFin,
    total,
  });
};

// Un cliente solo ve sus reservas; el admin puede ver todas y filtrar por usuario
const listar = (filtros = {}, solicitante) => {
  const query = {};
  if (solicitante && solicitante.rol !== 'admin') {
    query.usuario = solicitante.id;
  } else if (filtros.usuario) {
    query.usuario = filtros.usuario;
  }
  if (filtros.cancha) query.cancha = filtros.cancha;
  if (filtros.estado) query.estado = filtros.estado;

  return Reserva.find(query)
    .populate('cancha', 'nombre deporte ubicacion precioHora')
    .populate('usuario', 'nombre email')
    .sort({ fecha: 1, horaInicio: 1 });
};

// Solo el dueño de la reserva o un admin pueden cancelarla
const cancelar = async (id, solicitante) => {
  const reserva = await Reserva.findById(id);
  if (!reserva) throw new AppError('Reserva no encontrada', 404);
  if (solicitante && solicitante.rol !== 'admin' && reserva.usuario.toString() !== solicitante.id) {
    throw new AppError('No puedes cancelar una reserva de otro usuario', 403);
  }
  if (reserva.estado === 'cancelada') throw new AppError('La reserva ya está cancelada', 400);

  reserva.estado = 'cancelada';
  return reserva.save();
};

module.exports = { crear, listar, cancelar, verificarDisponibilidad };
