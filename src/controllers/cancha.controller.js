const { matchedData } = require('express-validator');
const canchaService = require('../services/cancha.service');

// matchedData: solo pasan al service los campos validados (evita que envíen "activa" o "_id")
const crear = async (req, res) => {
  const cancha = await canchaService.crear(matchedData(req, { locations: ['body'] }));
  res.status(201).json({ success: true, data: cancha });
};

const listar = async (req, res) => {
  const canchas = await canchaService.listar(matchedData(req, { locations: ['query'] }));
  res.json({ success: true, total: canchas.length, data: canchas });
};

const obtener = async (req, res) => {
  const cancha = await canchaService.obtenerPorId(req.params.id);
  res.json({ success: true, data: cancha });
};

const actualizar = async (req, res) => {
  const cancha = await canchaService.actualizar(req.params.id, matchedData(req, { locations: ['body'] }));
  res.json({ success: true, data: cancha });
};

const desactivar = async (req, res) => {
  const cancha = await canchaService.desactivar(req.params.id);
  res.json({ success: true, message: 'Cancha desactivada', data: cancha });
};

module.exports = { crear, listar, obtener, actualizar, desactivar };
