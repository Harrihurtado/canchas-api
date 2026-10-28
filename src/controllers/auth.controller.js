const { matchedData } = require('express-validator');
const authService = require('../services/auth.service');

const registrar = async (req, res) => {
  const usuario = await authService.registrar(matchedData(req, { locations: ['body'] }));
  res.status(201).json({ success: true, data: usuario });
};

const login = async (req, res) => {
  const { token, usuario } = await authService.login(matchedData(req, { locations: ['body'] }));
  res.json({ success: true, token, data: usuario });
};

module.exports = { registrar, login };
