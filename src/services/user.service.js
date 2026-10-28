const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const obtenerPorId = async (id) => {
  const usuario = await User.findById(id);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario;
};

// Solo nombre y teléfono: el rol y el correo no se cambian desde el perfil
const actualizarPerfil = async (id, { nombre, telefono }) => {
  const cambios = {};
  if (nombre !== undefined) cambios.nombre = nombre;
  if (telefono !== undefined) cambios.telefono = telefono;

  const usuario = await User.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario;
};

const listar = () => User.find().sort({ createdAt: -1 });

module.exports = { obtenerPorId, actualizarPerfil, listar };
