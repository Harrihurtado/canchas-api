/**
 * INTEGRACIÓN BIG BANG: todas las capas reales al mismo tiempo
 *
 * No hay stubs ni drivers: se integran TODAS las capas de una sola vez
 * (rutas → middlewares → controllers → services → modelos → MongoDB) y se
 * prueba un flujo de negocio completo de principio a fin, tal como lo
 * vivirían los usuarios reales de la API.
 */
const request = require('supertest');
const app = require('../../../src/app');
const db = require('../../helpers/db');
const { crearAdmin } = require('../../helpers/factories');

beforeAll(db.conectar);
afterAll(async () => {
  await db.limpiar();
  await db.desconectar();
});

describe('Big Bang: flujo completo de una reserva', () => {
  // Estado compartido entre los pasos del flujo (se ejecutan en orden)
  const ctx = {};
  const api = () => request(app);

  test('1. Un administrador inicia sesión', async () => {
    await crearAdmin({ email: 'admin@test.com', password: 'Admin12345' });

    const res = await api().post('/api/auth/login').send({ email: 'admin@test.com', password: 'Admin12345' });

    expect(res.status).toBe(200);
    ctx.tokenAdmin = res.body.token;
  });

  test('2. El administrador crea una cancha en el catálogo', async () => {
    const res = await api()
      .post('/api/canchas')
      .set('Authorization', `Bearer ${ctx.tokenAdmin}`)
      .send({ nombre: 'La Bombonera', deporte: 'futbol5', precioHora: 80000, capacidad: 10, ubicacion: 'Sede Norte' });

    expect(res.status).toBe(201);
    ctx.canchaId = res.body.data._id;
  });

  test('3. Un visitante se registra y luego inicia sesión', async () => {
    const registro = await api()
      .post('/api/auth/register')
      .send({ nombre: 'Ana', email: 'ana@test.com', password: 'Segura123' });
    expect(registro.status).toBe(201);
    expect(registro.body.data).not.toHaveProperty('password');

    const login = await api().post('/api/auth/login').send({ email: 'ana@test.com', password: 'Segura123' });
    expect(login.status).toBe(200);
    ctx.tokenAna = login.body.token;
  });

  test('4. Ana consulta el catálogo y encuentra la cancha', async () => {
    const res = await api().get('/api/canchas?deporte=futbol5');
    expect(res.status).toBe(200);
    expect(res.body.data.map((c) => c._id)).toContain(ctx.canchaId);
  });

  test('5. Ana reserva de 18:00 a 19:30 y el total se calcula solo', async () => {
    const res = await api()
      .post('/api/reservas')
      .set('Authorization', `Bearer ${ctx.tokenAna}`)
      .send({ cancha: ctx.canchaId, fecha: '2026-11-01', horaInicio: '18:00', horaFin: '19:30' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ total: 120000, estado: 'pendiente' });
    ctx.reservaAna = res.body.data._id;
  });

  test('6. Otro usuario intenta reservar la misma franja y recibe 409', async () => {
    await api().post('/api/auth/register').send({ nombre: 'Luis', email: 'luis@test.com', password: 'Segura123' });
    const login = await api().post('/api/auth/login').send({ email: 'luis@test.com', password: 'Segura123' });
    ctx.tokenLuis = login.body.token;

    const res = await api()
      .post('/api/reservas')
      .set('Authorization', `Bearer ${ctx.tokenLuis}`)
      .send({ cancha: ctx.canchaId, fecha: '2026-11-01', horaInicio: '19:00', horaFin: '20:00' });

    expect(res.status).toBe(409);
  });

  test('7. Luis no puede ver ni cancelar la reserva de Ana', async () => {
    const lista = await api().get('/api/reservas').set('Authorization', `Bearer ${ctx.tokenLuis}`);
    expect(lista.body.total).toBe(0);

    const cancelar = await api()
      .patch(`/api/reservas/${ctx.reservaAna}/cancelar`)
      .set('Authorization', `Bearer ${ctx.tokenLuis}`);
    expect(cancelar.status).toBe(403);
  });

  test('8. Ana ve su reserva con los datos de la cancha', async () => {
    const res = await api().get('/api/reservas').set('Authorization', `Bearer ${ctx.tokenAna}`);

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].cancha.nombre).toBe('La Bombonera');
  });

  test('9. Ana cancela su reserva', async () => {
    const res = await api()
      .patch(`/api/reservas/${ctx.reservaAna}/cancelar`)
      .set('Authorization', `Bearer ${ctx.tokenAna}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('cancelada');
  });

  test('10. Con la franja liberada, Luis ya puede reservar', async () => {
    const res = await api()
      .post('/api/reservas')
      .set('Authorization', `Bearer ${ctx.tokenLuis}`)
      .send({ cancha: ctx.canchaId, fecha: '2026-11-01', horaInicio: '19:00', horaFin: '20:00' });

    expect(res.status).toBe(201);
  });

  test('11. El administrador ve todas las reservas del sistema', async () => {
    const res = await api().get('/api/reservas').set('Authorization', `Bearer ${ctx.tokenAdmin}`);
    expect(res.body.total).toBe(2);
  });

  test('12. Ana actualiza su perfil, pero no puede volverse administradora', async () => {
    const res = await api()
      .put('/api/users/me')
      .set('Authorization', `Bearer ${ctx.tokenAna}`)
      .send({ nombre: 'Ana María', telefono: '3001234567', rol: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ nombre: 'Ana María', rol: 'cliente' });

    const usuarios = await api().get('/api/users').set('Authorization', `Bearer ${ctx.tokenAna}`);
    expect(usuarios.status).toBe(403);
  });
});
