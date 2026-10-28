const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { generarToken } = require('../utils/jwt');

const registrar = async ({ nombre, email, password, telefono }) => {
  const existe = await User.findOne({ email: email.toLowerCase() });
  if (existe) throw new AppError('El correo ya está registrado', 409);

  // El rol se fija aquí: nadie puede registrarse como admin desde la API
  const usuario = await User.create({ nombre, email, password, telefono, rol: 'cliente' });
  return usuario;
};

const login = async ({ email, password }) => {
  const usuario = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Mismo mensaje para correo o contraseña incorrectos: no revelamos cuál falló
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new AppError('Credenciales inválidas', 401);
  }

  return { token: generarToken(usuario), usuario };
};

module.exports = { registrar, login };
