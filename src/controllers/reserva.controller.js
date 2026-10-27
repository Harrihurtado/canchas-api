const { matchedData } = require('express-validator');
const reservaService = require('../services/reserva.service');

const crear = async (req, res) => {
  const reserva = await reservaService.crear(matchedData(req, { locations: ['body'] }));
  res.status(201).json({ success: true, data: reserva });
};

const listar = async (req, res) => {
  const reservas = await reservaService.listar(matchedData(req, { locations: ['query'] }));
  res.json({ success: true, total: reservas.length, data: reservas });
};

const cancelar = async (req, res) => {
  const reserva = await reservaService.cancelar(req.params.id);
  res.json({ success: true, message: 'Reserva cancelada', data: reserva });
};

module.exports = { crear, listar, cancelar };
