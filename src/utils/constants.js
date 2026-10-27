const DEPORTES = ['futbol5', 'futbol8', 'futbol11', 'voleibol', 'baloncesto', 'tenis'];
const SUPERFICIES = ['sintetica', 'natural', 'cemento', 'madera'];
const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'cancelada'];
const ROLES = ['cliente', 'admin'];
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm, de 00:00 a 23:59

module.exports = { DEPORTES, SUPERFICIES, ESTADOS_RESERVA, ROLES, HORA_REGEX };
