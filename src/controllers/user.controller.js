const { matchedData } = require('express-validator');
const userService = require('../services/user.service');

const perfil = async (req, res) => {
  const usuario = await userService.obtenerPorId(req.user.id);
  res.json({ success: true, data: usuario });
};

const actualizarPerfil = async (req, res) => {
  const usuario = await userService.actualizarPerfil(req.user.id, matchedData(req, { locations: ['body'] }));
  res.json({ success: true, data: usuario });
};

const listar = async (req, res) => {
  const usuarios = await userService.listar();
  res.json({ success: true, total: usuarios.length, data: usuarios });
};

module.exports = { perfil, actualizarPerfil, listar };
