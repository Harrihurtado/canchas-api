const Cancha = require('../models/cancha.model');
const AppError = require('../utils/AppError');

const crear = (datos) => Cancha.create(datos);

const listar = (filtros = {}) => {
  const query = { activa: true };
  if (filtros.deporte) query.deporte = filtros.deporte;
  return Cancha.find(query).sort({ nombre: 1 });
};

const obtenerPorId = async (id) => {
  const cancha = await Cancha.findById(id);
  if (!cancha || !cancha.activa) throw new AppError('Cancha no encontrada', 404);
  return cancha;
};

const actualizar = async (id, datos) => {
  const cancha = await Cancha.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  if (!cancha) throw new AppError('Cancha no encontrada', 404);
  return cancha;
};

// Borrado lógico: la cancha no se elimina, se marca como inactiva
const desactivar = async (id) => {
  const cancha = await Cancha.findByIdAndUpdate(id, { activa: false }, { new: true });
  if (!cancha) throw new AppError('Cancha no encontrada', 404);
  return cancha;
};

module.exports = { crear, listar, obtenerPorId, actualizar, desactivar };
