jest.mock('../../../src/utils/jwt', () => ({ verificarToken: jest.fn() }));
jest.mock('../../../src/models/user.model', () => ({ exists: jest.fn() }));

const { verificarToken } = require('../../../src/utils/jwt');
const User = require('../../../src/models/user.model');
const { authenticate, authorize } = require('../../../src/middlewares/auth');

// En los middlewares, req/res/next se simulan con objetos y funciones espía
const crearReq = (authorization) => ({ headers: authorization ? { authorization } : {} });

describe('middleware authenticate', () => {
  test('responde 401 si no hay header Authorization', async () => {
    const next = jest.fn();
    await authenticate(crearReq(), {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('responde 401 si el esquema no es Bearer', async () => {
    const next = jest.fn();
    await authenticate(crearReq('Basic abc123'), {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('responde 401 si el token es inválido o expiró', async () => {
    verificarToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const next = jest.fn();

    await authenticate(crearReq('Bearer token.malo'), {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: 'Token inválido o expirado' })
    );
  });

  test('responde 401 si el usuario del token ya no existe', async () => {
    verificarToken.mockReturnValue({ id: 'u1', rol: 'cliente' });
    User.exists.mockResolvedValue(null);
    const next = jest.fn();

    await authenticate(crearReq('Bearer token.valido'), {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('con un token válido deja el usuario en req.user y continúa', async () => {
    verificarToken.mockReturnValue({ id: 'u1', rol: 'admin', iat: 1, exp: 2 });
    User.exists.mockResolvedValue({ _id: 'u1' });
    const req = crearReq('Bearer token.valido');
    const next = jest.fn();

    await authenticate(req, {}, next);

    expect(req.user).toEqual({ id: 'u1', rol: 'admin' });
    expect(next).toHaveBeenCalledWith(); // sin error
  });
});

describe('middleware authorize', () => {
  test('permite el paso si el rol está autorizado', () => {
    const next = jest.fn();
    authorize('admin')({ user: { rol: 'admin' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('responde 403 si el rol no está autorizado', () => {
    const next = jest.fn();
    authorize('admin')({ user: { rol: 'cliente' } }, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('responde 403 si no hay usuario autenticado', () => {
    const next = jest.fn();
    authorize('admin')({}, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('acepta varios roles', () => {
    const next = jest.fn();
    authorize('admin', 'cliente')({ user: { rol: 'cliente' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
