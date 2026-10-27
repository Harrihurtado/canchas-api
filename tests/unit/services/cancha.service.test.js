// Prueba unitaria: el modelo Cancha se reemplaza por un MOCK.
// Así probamos solo la lógica del service, sin base de datos.
jest.mock('../../../src/models/cancha.model', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const Cancha = require('../../../src/models/cancha.model');
const canchaService = require('../../../src/services/cancha.service');
const AppError = require('../../../src/utils/AppError');

const ID = '6ae0e26aee9bf8a81ab44e3f';

describe('cancha.service', () => {
  describe('crear', () => {
    test('delega la creación al modelo con los datos recibidos', async () => {
      const datos = { nombre: 'La Bombonera', deporte: 'futbol5', precioHora: 80000 };
      Cancha.create.mockResolvedValue({ _id: ID, ...datos });

      const resultado = await canchaService.crear(datos);

      expect(Cancha.create).toHaveBeenCalledWith(datos);
      expect(resultado._id).toBe(ID);
    });
  });

  describe('listar', () => {
    test('sin filtros solo busca canchas activas, ordenadas por nombre', async () => {
      const sort = jest.fn().mockResolvedValue([]);
      Cancha.find.mockReturnValue({ sort });

      await canchaService.listar();

      expect(Cancha.find).toHaveBeenCalledWith({ activa: true });
      expect(sort).toHaveBeenCalledWith({ nombre: 1 });
    });

    test('aplica el filtro por deporte', async () => {
      Cancha.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await canchaService.listar({ deporte: 'futbol5' });

      expect(Cancha.find).toHaveBeenCalledWith({ activa: true, deporte: 'futbol5' });
    });
  });

  describe('obtenerPorId', () => {
    test('devuelve la cancha si existe y está activa', async () => {
      Cancha.findById.mockResolvedValue({ _id: ID, activa: true });
      await expect(canchaService.obtenerPorId(ID)).resolves.toEqual({ _id: ID, activa: true });
    });

    test('lanza 404 si la cancha no existe', async () => {
      Cancha.findById.mockResolvedValue(null);
      await expect(canchaService.obtenerPorId(ID)).rejects.toMatchObject({ statusCode: 404 });
    });

    test('lanza 404 si la cancha está inactiva', async () => {
      Cancha.findById.mockResolvedValue({ _id: ID, activa: false });
      await expect(canchaService.obtenerPorId(ID)).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('actualizar', () => {
    test('actualiza ejecutando las validaciones del esquema', async () => {
      Cancha.findByIdAndUpdate.mockResolvedValue({ _id: ID, precioHora: 90000 });

      const resultado = await canchaService.actualizar(ID, { precioHora: 90000 });

      expect(Cancha.findByIdAndUpdate).toHaveBeenCalledWith(
        ID,
        { precioHora: 90000 },
        { new: true, runValidators: true }
      );
      expect(resultado.precioHora).toBe(90000);
    });

    test('lanza 404 si la cancha no existe', async () => {
      Cancha.findByIdAndUpdate.mockResolvedValue(null);
      await expect(canchaService.actualizar(ID, {})).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('desactivar', () => {
    test('hace borrado lógico marcando activa = false', async () => {
      Cancha.findByIdAndUpdate.mockResolvedValue({ _id: ID, activa: false });

      const resultado = await canchaService.desactivar(ID);

      expect(Cancha.findByIdAndUpdate).toHaveBeenCalledWith(ID, { activa: false }, { new: true });
      expect(resultado.activa).toBe(false);
    });

    test('lanza 404 si la cancha no existe', async () => {
      Cancha.findByIdAndUpdate.mockResolvedValue(null);
      await expect(canchaService.desactivar(ID)).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
