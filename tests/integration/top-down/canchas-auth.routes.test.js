/**
 * INTEGRACIÓN TOP-DOWN: rutas de canchas y de autenticación con services como STUBS.
 */
jest.mock('../../../src/services/cancha.service', () => ({
  crear: jest.fn(),
  listar: jest.fn(),
  obtenerPorId: jest.fn(),
  actualizar: jest.fn(),
  desactivar: jest.fn(),
}));
jest.mock('../../../src/services/auth.service', () => ({
  registrar: jest.fn(),
  login: jest.fn(),
}));
jest.mock('../../../src/models/user.model', () => ({ exists: jest.fn() }));

const request = require('supertest');
const app = require('../../../src/app');
const canchaService = require('../../../src/services/cancha.service');
const authService = require('../../../src/services/auth.service');
const User = require('../../../src/models/user.model');
const AppError = require('../../../src/utils/AppError');
const { generarToken } = require('../../../src/utils/jwt');

const ADMIN = { _id: '6ae0e26aee9bf8a81ab44e3c', rol: 'admin' };
const CLIENTE = { _id: '6ae0e27deef6ec15268e9a21', rol: 'cliente' };
const tokenAdmin = generarToken(ADMIN);
const tokenCliente = generarToken(CLIENTE);
const canchaValida = { nombre: 'Tenis 1', deporte: 'tenis', precioHora: 40000, capacidad: 4, ubicacion: 'Sur' };

beforeEach(() => {
  User.exists.mockResolvedValue({ _id: 'existe' });
});

describe('Top-down: catálogo de canchas', () => {
  test('GET /api/canchas es público y devuelve lo que entrega el service', async () => {
    canchaService.listar.mockResolvedValue([{ nombre: 'A' }, { nombre: 'B' }]);

    const res = await request(app).get('/api/canchas?deporte=futbol5');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, total: 2, data: [{ nombre: 'A' }, { nombre: 'B' }] });
    expect(canchaService.listar).toHaveBeenCalledWith({ deporte: 'futbol5' });
  });

  test('GET /api/canchas/:id propaga el 404 del service', async () => {
    canchaService.obtenerPorId.mockRejectedValue(new AppError('Cancha no encontrada', 404));
    const res = await request(app).get('/api/canchas/6ae0e26aee9bf8a81ab44e3f');
    expect(res.status).toBe(404);
  });

  test('POST /api/canchas con rol cliente responde 403', async () => {
    const res = await request(app).post('/api/canchas').set('Authorization', `Bearer ${tokenCliente}`).send(canchaValida);
    expect(res.status).toBe(403);
    expect(canchaService.crear).not.toHaveBeenCalled();
  });

  test('POST /api/canchas con rol admin responde 201 y no deja pasar campos no permitidos', async () => {
    canchaService.crear.mockResolvedValue({ _id: 'c1', ...canchaValida });

    const res = await request(app)
      .post('/api/canchas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...canchaValida, activa: false, _id: 'inyectado' });

    expect(res.status).toBe(201);
    expect(canchaService.crear).toHaveBeenCalledWith(canchaValida);
  });

  test('POST /api/canchas convierte precioHora y capacidad de texto a número', async () => {
    canchaService.crear.mockResolvedValue({});

    await request(app)
      .post('/api/canchas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...canchaValida, precioHora: '40000', capacidad: '4' });

    expect(canchaService.crear).toHaveBeenCalledWith(expect.objectContaining({ precioHora: 40000, capacidad: 4 }));
  });

  test('DELETE /api/canchas/:id con admin desactiva la cancha', async () => {
    canchaService.desactivar.mockResolvedValue({ activa: false });
    const res = await request(app)
      .delete('/api/canchas/6ae0e26aee9bf8a81ab44e3f')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Cancha desactivada');
  });
});

describe('Top-down: autenticación', () => {
  test('POST /api/auth/register no permite que el cliente elija su rol', async () => {
    authService.registrar.mockResolvedValue({ _id: 'u1', rol: 'cliente' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Harri', email: 'Harri@Test.com', password: 'Segura123', rol: 'admin' });

    expect(res.status).toBe(201);
    expect(authService.registrar).toHaveBeenCalledWith({ nombre: 'Harri', email: 'harri@test.com', password: 'Segura123' });
  });

  test('POST /api/auth/login devuelve el token entregado por el service', async () => {
    authService.login.mockResolvedValue({ token: 'abc.def.ghi', usuario: { _id: 'u1' } });

    const res = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'Segura123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('abc.def.ghi');
  });

  test('POST /api/auth/login rechaza un intento de inyección NoSQL con 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });

    expect(res.status).toBe(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  test('una ruta inexistente responde 404 con el formato estándar', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
