const jwt = require('jsonwebtoken');
const config = require('../config/env');

// El token solo lleva lo necesario para autorizar: id y rol (nunca datos sensibles)
const generarToken = (usuario) =>
  jwt.sign({ id: usuario._id.toString(), rol: usuario.rol }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

// Lanza un error si el token es inválido o expiró
const verificarToken = (token) => jwt.verify(token, config.jwtSecret);

module.exports = { generarToken, verificarToken };
