/**
 * INTEGRACIÓN BOTTOM-UP — Nivel 1: Modelos + MongoDB
 *
 * Se empieza por la capa más baja (los modelos de Mongoose) integrada con la
 * base de datos REAL. No hay services, controllers ni rutas: el propio archivo
 * de prueba actúa como DRIVER, es decir, el código que "maneja" la capa
 * inferior porque la capa superior todavía no se integra.
 */
const bcrypt = require('bcryptjs');
const User = require('../../../src/models/user.model');
const Cancha = require('../../../src/models/cancha.model');
const Reserva = require('../../../src/models/reserva.model');
const db = require('../../helpers/db');
const { crearUsuario, crearCancha } = require('../../helpers/factories');

beforeAll(db.conectar);
afterEach(db.limpiar);
afterAll(db.desconectar);

describe('Bottom-up nivel 1: modelo User + MongoDB', () => {
  test('guarda la contraseña cifrada con bcrypt, nunca en texto plano', async () => {
    const usuario = await crearUsuario({ password: 'MiClave123' });
    const enBD = await User.findById(usuario._id).select('+password');

    expect(enBD.password).not.toBe('MiClave123');
    expect(enBD.password).toMatch(/^\$2[aby]\$10\$/);
    await expect(bcrypt.compare('MiClave123', enBD.password)).resolves.toBe(true);
  });

  test('no devuelve la contraseña en las consultas normales (select: false)', async () => {
    const usuario = await crearUsuario();
    const enBD = await User.findById(usuario._id);
    expect(enBD.password).toBeUndefined();
  });

  test('no incluye la contraseña al convertir a JSON', async () => {
    const usuario = await crearUsuario();
    expect(usuario.toJSON()).not.toHaveProperty('password');
  });

  test('el índice único de MongoDB impide correos duplicados (código 11000)', async () => {
    await crearUsuario({ email: 'repetido@test.com' });
    await expect(crearUsuario({ email: 'REPETIDO@test.com' })).rejects.toMatchObject({ code: 11000 });
  });

  test('no vuelve a cifrar la contraseña si se actualiza otro campo', async () => {
    const usuario = await crearUsuario({ password: 'MiClave123' });
    usuario.nombre = 'Otro nombre';
    await usuario.save();

    const enBD = await User.findById(usuario._id).select('+password');
    await expect(enBD.compararPassword('MiClave123')).resolves.toBe(true);
  });
});

describe('Bottom-up nivel 1: modelos Cancha y Reserva + MongoDB', () => {
  test('rechaza un deporte que no está en el catálogo', async () => {
    await expect(crearCancha({ deporte: 'golf' })).rejects.toMatchObject({ name: 'ValidationError' });
  });

  test('rechaza un precio negativo', async () => {
    await expect(crearCancha({ precioHora: -1 })).rejects.toMatchObject({ name: 'ValidationError' });
  });

  test('la reserva guarda referencias que se pueden poblar con populate', async () => {
    const usuario = await crearUsuario({ nombre: 'Ana' });
    const cancha = await crearCancha({ nombre: 'La Bombonera' });
    const reserva = await Reserva.create({
      usuario: usuario._id,
      cancha: cancha._id,
      fecha: new Date('2026-11-01'),
      horaInicio: '18:00',
      horaFin: '19:00',
      total: 80000,
    });

    const poblada = await Reserva.findById(reserva._id).populate('usuario').populate('cancha');

    expect(poblada.usuario.nombre).toBe('Ana');
    expect(poblada.cancha.nombre).toBe('La Bombonera');
    expect(poblada.estado).toBe('pendiente');
  });

  test('rechaza horas con formato inválido', async () => {
    const usuario = await crearUsuario();
    const cancha = await crearCancha();
    await expect(
      Reserva.create({
        usuario: usuario._id,
        cancha: cancha._id,
        fecha: new Date('2026-11-01'),
        horaInicio: '6:00',
        horaFin: '25:00',
        total: 1,
      })
    ).rejects.toMatchObject({ name: 'ValidationError' });
  });
});
