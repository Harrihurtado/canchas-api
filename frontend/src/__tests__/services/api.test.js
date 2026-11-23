import { ApiError, request, tokenStorage } from '../../services/api';

// fetch simulado: devuelve el status y el cuerpo JSON indicados
const respuesta = (status, cuerpo) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) });

describe('cliente HTTP (services/api)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('hace la petición a /api y devuelve el JSON', async () => {
    fetch.mockResolvedValue(respuesta(200, { success: true, data: [] }));

    const data = await request('/canchas');

    expect(fetch).toHaveBeenCalledWith('/api/canchas', { method: 'GET', headers: {}, body: undefined });
    expect(data).toEqual({ success: true, data: [] });
  });

  test('envía el cuerpo como JSON y el token cuando la petición es autenticada', async () => {
    tokenStorage.set('token-123');
    fetch.mockResolvedValue(respuesta(201, { success: true }));

    await request('/reservas', { method: 'POST', body: { cancha: 'c1' }, auth: true });

    expect(fetch).toHaveBeenCalledWith('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-123' },
      body: JSON.stringify({ cancha: 'c1' }),
    });
  });

  test('no envía Authorization en peticiones públicas aunque haya token', async () => {
    tokenStorage.set('token-123');
    fetch.mockResolvedValue(respuesta(200, {}));

    await request('/canchas');

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });

  test('lanza ApiError con el mensaje, el código y los detalles de la API', async () => {
    const detalles = [{ campo: 'email', mensaje: 'inválido' }];
    fetch.mockResolvedValue(respuesta(400, { success: false, message: 'Datos inválidos', details: detalles }));

    await expect(request('/auth/register', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Datos inválidos',
      status: 400,
      details: detalles,
    });
  });

  test('si el servidor no responde, lanza un error claro con status 0', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await request('/canchas').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/No se pudo conectar/);
  });

  test('tokenStorage guarda, lee y borra el token', () => {
    tokenStorage.set('abc');
    expect(tokenStorage.get()).toBe('abc');
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });
});
