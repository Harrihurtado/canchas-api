jest.mock('../../../src/models/user.model', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
}));

const User = require('../../../src/models/user.model');
const userService = require('../../../src/services/user.service');

const ID = '6ae0e27deef6ec15268e9a21';

describe('user.service', () => {
  describe('obtenerPorId', () => {
    test('devuelve el usuario si existe', async () => {
      User.findById.mockResolvedValue({ _id: ID, nombre: 'Harri' });
      await expect(userService.obtenerPorId(ID)).resolves.toMatchObject({ nombre: 'Harri' });
    });

    test('lanza 404 si no existe', async () => {
      User.findById.mockResolvedValue(null);
      await expect(userService.obtenerPorId(ID)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('actualizarPerfil', () => {
    test('solo actualiza nombre y teléfono, ignorando rol y email', async () => {
      User.findByIdAndUpdate.mockResolvedValue({ _id: ID });

      await userService.actualizarPerfil(ID, {
        nombre: 'Harri H',
        telefono: '3001234567',
        rol: 'admin',
        email: 'hacker@x.com',
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        ID,
        { nombre: 'Harri H', telefono: '3001234567' },
        { new: true, runValidators: true }
      );
    });

    test('si solo llega el nombre, no toca el teléfono', async () => {
      User.findByIdAndUpdate.mockResolvedValue({ _id: ID });
      await userService.actualizarPerfil(ID, { nombre: 'Nuevo' });
      expect(User.findByIdAndUpdate.mock.calls[0][1]).toEqual({ nombre: 'Nuevo' });
    });

    test('lanza 404 si el usuario no existe', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);
      await expect(userService.actualizarPerfil(ID, { nombre: 'X' })).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('listar', () => {
    test('lista los usuarios del más reciente al más antiguo', async () => {
      const sort = jest.fn().mockResolvedValue([]);
      User.find.mockReturnValue({ sort });

      await userService.listar();

      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
