// Fábricas de datos de prueba: crean registros válidos con valores por defecto.
const User = require('../../src/models/user.model');
const Cancha = require('../../src/models/cancha.model');
const { generarToken } = require('../../src/utils/jwt');

let contador = 0;
const unico = () => {
  contador += 1;
  return `${Date.now()}${contador}`;
};

const crearUsuario = (datos = {}) =>
  User.create({
    nombre: 'Usuario Prueba',
    email: `usuario${unico()}@test.com`,
    password: 'Password123',
    rol: 'cliente',
    ...datos,
  });

const crearAdmin = (datos = {}) => crearUsuario({ nombre: 'Admin Prueba', rol: 'admin', ...datos });

const crearCancha = (datos = {}) =>
  Cancha.create({
    nombre: `Cancha ${unico()}`,
    deporte: 'futbol5',
    superficie: 'sintetica',
    precioHora: 80000,
    capacidad: 10,
    ubicacion: 'Sede Norte',
    ...datos,
  });

const tokenDe = (usuario) => generarToken(usuario);

module.exports = { crearUsuario, crearAdmin, crearCancha, tokenDe };
