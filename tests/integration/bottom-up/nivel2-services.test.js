/**
 * INTEGRACIÓN BOTTOM-UP — Nivel 2: Services + Modelos + MongoDB
 *
 * Se sube un nivel: ahora se integran los services con los modelos y la BD
 * REAL. Los controllers y las rutas aún no participan, así que se usan
 * DRIVERS: funciones que invocan directamente los services, simulando lo que
 * haría la capa superior (el controller) cuando exista.
 */
const reservaService = require('../../../src/services/reserva.service');
const authService = require('../../../src/services/auth.service');
const canchaService = require('../../../src/services/cancha.service');
const db = require('../../helpers/db');
const { crearUsuario, crearCancha } = require('../../helpers/factories');

beforeAll(db.conectar);
afterEach(db.limpiar);
afterAll(db.desconectar);

// ---- DRIVERS: reemplazan temporalmente a los controllers ----
const driverReservar = (usuario, cancha, fecha, horaInicio, horaFin) =>
  reservaService.crear({ usuario: usuario._id.toString(), cancha: cancha._id.toString(), fecha, horaInicio, horaFin });

const driverCancelar = (reserva, solicitante) =>
  reservaService.cancelar(reserva._id, { id: solicitante._id.toString(), rol: solicitante.rol });

describe('Bottom-up nivel 2: reserva.service + MongoDB (regla de cruces con datos reales)', () => {
  let cliente;
  let cancha;

  beforeEach(async () => {
    cliente = await crearUsuario();
    cancha = await crearCancha({ precioHora: 80000 });
    await driverReservar(cliente, cancha, '2026-11-01', '18:00', '19:00'); // reserva base
  });

  test.each([
    ['empieza dentro de la existente', '18:30', '19:30'],
    ['termina dentro de la existente', '17:30', '18:30'],
    ['envuelve a la existente', '17:00', '20:00'],
    ['queda dentro de la existente', '18:15', '18:45'],
    ['es exactamente la misma franja', '18:00', '19:00'],
  ])('rechaza con 409 una reserva que %s', async (_caso, inicio, fin) => {
    await expect(driverReservar(cliente, cancha, '2026-11-01', inicio, fin)).rejects.toMatchObject({ statusCode: 409 });
  });

  test.each([
    ['contigua después (19:00-20:00)', '2026-11-01', '19:00', '20:00'],
    ['contigua antes (17:00-18:00)', '2026-11-01', '17:00', '18:00'],
    ['misma hora pero otro día', '2026-11-02', '18:00', '19:00'],
  ])('permite una reserva %s', async (_caso, fecha, inicio, fin) => {
    await expect(driverReservar(cliente, cancha, fecha, inicio, fin)).resolves.toMatchObject({ estado: 'pendiente' });
  });

  test('permite la misma franja en OTRA cancha', async () => {
    const otraCancha = await crearCancha();
    await expect(driverReservar(cliente, otraCancha, '2026-11-01', '18:00', '19:00')).resolves.toBeDefined();
  });

  test('una reserva cancelada libera el horario', async () => {
    const { data: [existente] } = await reservaService.listar({}, { id: cliente._id.toString(), rol: 'cliente' });
    await driverCancelar(existente, cliente);

    await expect(driverReservar(cliente, cancha, '2026-11-01', '18:30', '19:30')).resolves.toBeDefined();
  });

  test('calcula y guarda el total con el precio real de la cancha', async () => {
    const reserva = await driverReservar(cliente, cancha, '2026-11-03', '10:00', '11:30');
    expect(reserva.total).toBe(120000);
  });

  test('no permite reservar una cancha desactivada', async () => {
    await canchaService.desactivar(cancha._id);
    await expect(driverReservar(cliente, cancha, '2026-11-05', '10:00', '11:00')).rejects.toMatchObject({ statusCode: 404 });
  });

  test('listar devuelve la cancha y el usuario poblados desde la BD', async () => {
    const { data: [reserva] } = await reservaService.listar({}, { id: cliente._id.toString(), rol: 'cliente' });
    expect(reserva.cancha.nombre).toBe(cancha.nombre);
    expect(reserva.usuario.email).toBe(cliente.email);
  });

  test('un cliente no puede cancelar la reserva de otro (y la reserva sigue activa)', async () => {
    const intruso = await crearUsuario();
    const { data: [reserva] } = await reservaService.listar({}, { id: cliente._id.toString(), rol: 'cliente' });

    await expect(driverCancelar(reserva, intruso)).rejects.toMatchObject({ statusCode: 403 });

    const { data: [sinCambios] } = await reservaService.listar({}, { id: cliente._id.toString(), rol: 'cliente' });
    expect(sinCambios.estado).toBe('pendiente');
  });
});

describe('Bottom-up nivel 2: paginación del listado de reservas (regresión del bug de rendimiento)', () => {
  let cliente;
  const solicitante = () => ({ id: cliente._id.toString(), rol: 'cliente' });

  beforeEach(async () => {
    cliente = await crearUsuario();
    const cancha = await crearCancha();
    // 25 reservas en días distintos (en desorden, para comprobar el ordenamiento)
    const dias = Array.from({ length: 25 }, (_, i) => 25 - i);
    await Promise.all(
      dias.map((d) => driverReservar(cliente, cancha, `2027-01-${String(d).padStart(2, '0')}`, '18:00', '19:00'))
    );
  });

  test('por defecto devuelve solo 20 reservas, pero informa el total real', async () => {
    const resultado = await reservaService.listar({}, solicitante());

    expect(resultado.data).toHaveLength(20);
    expect(resultado).toMatchObject({ total: 25, pagina: 1, limite: 20, paginas: 2 });
  });

  test('la página 2 trae las 5 restantes', async () => {
    const resultado = await reservaService.listar({ pagina: 2 }, solicitante());
    expect(resultado.data).toHaveLength(5);
  });

  test('las páginas vienen ordenadas por fecha y no se repiten reservas', async () => {
    const p1 = await reservaService.listar({ limite: 10 }, solicitante());
    const p2 = await reservaService.listar({ limite: 10, pagina: 2 }, solicitante());
    const fechas = [...p1.data, ...p2.data].map((r) => r.fecha.toISOString().slice(0, 10));

    expect(fechas[0]).toBe('2027-01-01');
    expect(fechas).toEqual([...fechas].sort());
    expect(new Set(fechas).size).toBe(20);
  });

  test('la consulta de "mis reservas" usa el índice por usuario (no recorre toda la colección)', async () => {
    const Reserva = require('../../../src/models/reserva.model');
    const plan = await Reserva.find({ usuario: cliente._id }).sort({ fecha: 1, horaInicio: 1 }).explain('queryPlanner');
    const ganador = JSON.stringify(plan.queryPlanner.winningPlan);

    expect(ganador).toContain('IXSCAN');
    expect(ganador).toContain('usuario_1_fecha_1_horaInicio_1');
  });
});

describe('Bottom-up nivel 2: auth.service + bcrypt + JWT + MongoDB', () => {
  test('un usuario registrado puede iniciar sesión con su contraseña real', async () => {
    await authService.registrar({ nombre: 'Harri', email: 'harri@test.com', password: 'Segura123' });

    const { token, usuario } = await authService.login({ email: 'harri@test.com', password: 'Segura123' });

    expect(token.split('.')).toHaveLength(3); // header.payload.firma
    expect(usuario.rol).toBe('cliente');
  });

  test('el login falla con una contraseña distinta', async () => {
    await authService.registrar({ nombre: 'Harri', email: 'harri@test.com', password: 'Segura123' });
    await expect(authService.login({ email: 'harri@test.com', password: 'Otra12345' })).rejects.toMatchObject({ statusCode: 401 });
  });

  test('el registro detecta correos duplicados aunque cambien las mayúsculas', async () => {
    await authService.registrar({ nombre: 'Harri', email: 'harri@test.com', password: 'Segura123' });
    await expect(
      authService.registrar({ nombre: 'Otro', email: 'HARRI@test.com', password: 'Segura123' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
