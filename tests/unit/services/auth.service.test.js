jest.mock('../../../src/models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
// También simulamos la utilidad JWT: aquí solo nos interesa la lógica del login
jest.mock('../../../src/utils/jwt', () => ({
  generarToken: jest.fn(() => 'token-simulado'),
}));

const User = require('../../../src/models/user.model');
const { generarToken } = require('../../../src/utils/jwt');
const authService = require('../../../src/services/auth.service');

describe('auth.service', () => {
  describe('registrar', () => {
    const datos = { nombre: 'Harri', email: 'Harri@Test.com', password: 'Segura123', telefono: '3001234567' };

    test('crea el usuario siempre con rol "cliente"', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockImplementation(async (doc) => ({ _id: 'u1', ...doc }));

      const usuario = await authService.registrar(datos);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ rol: 'cliente' }));
      expect(usuario.rol).toBe('cliente');
    });

    test('busca el correo en minúsculas para evitar duplicados por mayúsculas', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({});

      await authService.registrar(datos);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'harri@test.com' });
    });

    test('lanza 409 si el correo ya está registrado', async () => {
      User.findOne.mockResolvedValue({ _id: 'existente' });

      await expect(authService.registrar(datos)).rejects.toMatchObject({ statusCode: 409 });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const mockBusqueda = (usuario) => {
      const select = jest.fn().mockResolvedValue(usuario);
      User.findOne.mockReturnValue({ select });
      return select;
    };

    test('devuelve token y usuario con credenciales correctas', async () => {
      const usuario = { _id: 'u1', rol: 'cliente', compararPassword: jest.fn().mockResolvedValue(true) };
      const select = mockBusqueda(usuario);

      const resultado = await authService.login({ email: 'Harri@Test.com', password: 'Segura123' });

      expect(select).toHaveBeenCalledWith('+password');
      expect(usuario.compararPassword).toHaveBeenCalledWith('Segura123');
      expect(generarToken).toHaveBeenCalledWith(usuario);
      expect(resultado).toEqual({ token: 'token-simulado', usuario });
    });

    test('lanza 401 genérico si el correo no existe', async () => {
      mockBusqueda(null);

      await expect(authService.login({ email: 'nadie@test.com', password: 'x' })).rejects.toMatchObject({
        statusCode: 401,
        message: 'Credenciales inválidas',
      });
      expect(generarToken).not.toHaveBeenCalled();
    });

    test('lanza el MISMO 401 genérico si la contraseña es incorrecta', async () => {
      mockBusqueda({ compararPassword: jest.fn().mockResolvedValue(false) });

      await expect(authService.login({ email: 'harri@test.com', password: 'mala' })).rejects.toMatchObject({
        statusCode: 401,
        message: 'Credenciales inválidas',
      });
      expect(generarToken).not.toHaveBeenCalled();
    });
  });
});
