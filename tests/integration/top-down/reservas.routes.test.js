/**
 * INTEGRACIÓN TOP-DOWN: Rutas + Middlewares + Validadores + Controllers
 *
 * Se empieza por la capa más alta (la API HTTP, usando Supertest) y se van
 * integrando las capas hacia abajo. La capa inferior (services) todavía "no
 * se integra": se reemplaza por STUBS, que son versiones falsas que devuelven
 * respuestas fijas. Así se verifica que las capas superiores se comuniquen
 * bien entre sí y con lo que esperan recibir de abajo.
 */

// ---- STUBS de la capa de services ----
jest.mock('../../../src/services/reserva.service', () => ({
  crear: jest.fn(),
  listar: jest.fn(),
  cancelar: jest.fn(),
}));
// Stub del modelo usado por el middleware authenticate (para no requerir BD)
jest.mock('../../../src/models/user.model', () => ({ exists: jest.fn() }));

const request = require('supertest');
const app = require('../../../src/app');
const reservaService = require('../../../src/services/reserva.service');
const User = require('../../../src/models/user.model');
const AppError = require('../../../src/utils/AppError');
const { generarToken } = require('../../../src/utils/jwt');

const CLIENTE = { _id: '6ae0e27deef6ec15268e9a21', rol: 'cliente' };
const CANCHA = '6ae0e26aee9bf8a81ab44e3f';
const token = generarToken(CLIENTE);
const reservaValida = { cancha: CANCHA, fecha: '2026-11-01', horaInicio: '18:00', horaFin: '19:00' };

beforeEach(() => {
  User.exists.mockResolvedValue({ _id: CLIENTE._id });
});

describe('Top-down: POST /api/reservas', () => {
  test('sin token responde 401 y nunca llega al service', async () => {
    const res = await request(app).post('/api/reservas').send(reservaValida);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'No autenticado: falta el token' });
    expect(reservaService.crear).not.toHaveBeenCalled();
  });

  test('con datos inválidos el validador responde 400 y nunca llega al service', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({ cancha: 'no-es-id', fecha: '01/11/2026', horaInicio: '6pm' });

    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.campo)).toEqual(
      expect.arrayContaining(['cancha', 'fecha', 'horaInicio', 'horaFin'])
    );
    expect(reservaService.crear).not.toHaveBeenCalled();
  });

  test('el controller toma el usuario del TOKEN, ignorando el que venga en el body', async () => {
    reservaService.crear.mockResolvedValue({ _id: 'r1', ...reservaValida, total: 80000, estado: 'pendiente' });

    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...reservaValida, usuario: '000000000000000000000000', total: 1, estado: 'confirmada' });

    expect(res.status).toBe(201);
    expect(reservaService.crear).toHaveBeenCalledWith({ ...reservaValida, usuario: CLIENTE._id });
    expect(res.body).toMatchObject({ success: true, data: { _id: 'r1', total: 80000 } });
  });

  test('un AppError 409 del service se convierte en respuesta HTTP 409', async () => {
    reservaService.crear.mockRejectedValue(new AppError('La cancha ya está reservada de 18:00 a 19:00 en esa fecha', 409));

    const res = await request(app).post('/api/reservas').set('Authorization', `Bearer ${token}`).send(reservaValida);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: 'La cancha ya está reservada de 18:00 a 19:00 en esa fecha' });
  });

  test('un error inesperado del service responde 500 sin exponer el stack', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    reservaService.crear.mockRejectedValue(new Error('se cayó la BD'));

    const res = await request(app).post('/api/reservas').set('Authorization', `Bearer ${token}`).send(reservaValida);

    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty('stack');
    console.error.mockRestore();
  });
});

describe('Top-down: GET /api/reservas y PATCH /api/reservas/:id/cancelar', () => {
  test('GET pasa al service los filtros validados y el usuario autenticado', async () => {
    reservaService.listar.mockResolvedValue([{ _id: 'r1' }, { _id: 'r2' }]);

    const res = await request(app)
      .get('/api/reservas?estado=pendiente&otro=ignorado')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(reservaService.listar).toHaveBeenCalledWith({ estado: 'pendiente' }, { id: CLIENTE._id, rol: 'cliente' });
  });

  test('GET con un estado inválido responde 400', async () => {
    const res = await request(app).get('/api/reservas?estado=perdida').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('PATCH cancelar pasa el id y el solicitante al service', async () => {
    reservaService.cancelar.mockResolvedValue({ _id: CANCHA, estado: 'cancelada' });

    const res = await request(app).patch(`/api/reservas/${CANCHA}/cancelar`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reserva cancelada');
    expect(reservaService.cancelar).toHaveBeenCalledWith(CANCHA, { id: CLIENTE._id, rol: 'cliente' });
  });

  test('PATCH con un id mal formado responde 400 sin llamar al service', async () => {
    const res = await request(app).patch('/api/reservas/123/cancelar').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(reservaService.cancelar).not.toHaveBeenCalled();
  });
});
