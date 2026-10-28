// Prueba unitaria del service de reservas con los tres modelos simulados (mocks).
jest.mock('../../../src/models/reserva.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
}));
jest.mock('../../../src/models/cancha.model', () => ({ findById: jest.fn() }));
jest.mock('../../../src/models/user.model', () => ({ findById: jest.fn() }));

const Reserva = require('../../../src/models/reserva.model');
const Cancha = require('../../../src/models/cancha.model');
const User = require('../../../src/models/user.model');
const reservaService = require('../../../src/services/reserva.service');

const USUARIO = '6ae0e27deef6ec15268e9a21';
const OTRO_USUARIO = '6ae0e26aee9bf8a81ab44e3b';
const CANCHA = '6ae0e26aee9bf8a81ab44e3f';

const datosValidos = {
  usuario: USUARIO,
  cancha: CANCHA,
  fecha: '2026-11-01',
  horaInicio: '18:00',
  horaFin: '19:30',
};

describe('reserva.service', () => {
  describe('crear', () => {
    beforeEach(() => {
      User.findById.mockResolvedValue({ _id: USUARIO });
      Cancha.findById.mockResolvedValue({ _id: CANCHA, activa: true, precioHora: 80000 });
      Reserva.findOne.mockResolvedValue(null); // sin cruces
      Reserva.create.mockImplementation(async (doc) => ({ _id: 'nueva', estado: 'pendiente', ...doc }));
    });

    test('crea la reserva y calcula el total (1.5 h × 80.000 = 120.000)', async () => {
      const reserva = await reservaService.crear(datosValidos);

      expect(reserva.total).toBe(120000);
      expect(reserva.estado).toBe('pendiente');
      expect(Reserva.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: USUARIO, cancha: CANCHA, total: 120000 })
      );
    });

    test('guarda la fecha como objeto Date a medianoche UTC', async () => {
      await reservaService.crear(datosValidos);

      const doc = Reserva.create.mock.calls[0][0];
      expect(doc.fecha).toBeInstanceOf(Date);
      expect(doc.fecha.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    });

    test.each([
      ['la hora de fin es menor', '20:00', '19:00'],
      ['las horas son iguales', '18:00', '18:00'],
    ])('lanza 400 si %s, sin consultar la base de datos', async (_caso, horaInicio, horaFin) => {
      await expect(
        reservaService.crear({ ...datosValidos, horaInicio, horaFin })
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(User.findById).not.toHaveBeenCalled();
      expect(Reserva.create).not.toHaveBeenCalled();
    });

    test('lanza 404 si el usuario no existe', async () => {
      User.findById.mockResolvedValue(null);
      await expect(reservaService.crear(datosValidos)).rejects.toMatchObject({ statusCode: 404 });
      expect(Reserva.create).not.toHaveBeenCalled();
    });

    test('lanza 404 si la cancha no existe', async () => {
      Cancha.findById.mockResolvedValue(null);
      await expect(reservaService.crear(datosValidos)).rejects.toMatchObject({ statusCode: 404 });
    });

    test('lanza 404 si la cancha está inactiva', async () => {
      Cancha.findById.mockResolvedValue({ _id: CANCHA, activa: false, precioHora: 80000 });
      await expect(reservaService.crear(datosValidos)).rejects.toMatchObject({ statusCode: 404 });
    });

    test('lanza 409 si existe una reserva que se cruza, y no la crea', async () => {
      Reserva.findOne.mockResolvedValue({ horaInicio: '18:00', horaFin: '19:00' });

      await expect(reservaService.crear(datosValidos)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('18:00 a 19:00'),
      });
      expect(Reserva.create).not.toHaveBeenCalled();
    });
  });

  describe('verificarDisponibilidad (regla de cruce de horarios)', () => {
    test('busca cruces con la condición inicioA < finB y inicioB < finA, ignorando canceladas', async () => {
      Reserva.findOne.mockResolvedValue(null);
      const fecha = new Date('2026-11-01');

      await reservaService.verificarDisponibilidad(CANCHA, fecha, '18:30', '19:30');

      expect(Reserva.findOne).toHaveBeenCalledWith({
        cancha: CANCHA,
        fecha,
        estado: { $ne: 'cancelada' },
        horaInicio: { $lt: '19:30' },
        horaFin: { $gt: '18:30' },
      });
    });

    test('no lanza error si no hay cruces', async () => {
      Reserva.findOne.mockResolvedValue(null);
      await expect(
        reservaService.verificarDisponibilidad(CANCHA, new Date(), '19:00', '20:00')
      ).resolves.toBeUndefined();
    });
  });

  describe('listar', () => {
    // Simula la cadena find().populate().populate().sort().skip().limit().lean()
    const mockConsulta = (resultado = [], total = 0) => {
      const cadena = {};
      ['populate', 'sort', 'skip', 'limit'].forEach((metodo) => {
        cadena[metodo] = jest.fn().mockReturnValue(cadena);
      });
      cadena.lean = jest.fn().mockResolvedValue(resultado);
      Reserva.find.mockReturnValue(cadena);
      Reserva.countDocuments.mockResolvedValue(total);
      return cadena;
    };

    test('un cliente solo ve sus reservas aunque pida las de otro usuario', async () => {
      mockConsulta();
      await reservaService.listar({ usuario: OTRO_USUARIO }, { id: USUARIO, rol: 'cliente' });
      expect(Reserva.find).toHaveBeenCalledWith({ usuario: USUARIO });
      expect(Reserva.countDocuments).toHaveBeenCalledWith({ usuario: USUARIO });
    });

    test('un admin puede filtrar por cualquier usuario, cancha y estado', async () => {
      mockConsulta();
      await reservaService.listar(
        { usuario: OTRO_USUARIO, cancha: CANCHA, estado: 'pendiente' },
        { id: USUARIO, rol: 'admin' }
      );
      expect(Reserva.find).toHaveBeenCalledWith({ usuario: OTRO_USUARIO, cancha: CANCHA, estado: 'pendiente' });
    });

    test('pobla cancha y usuario, ordena por fecha y hora y devuelve objetos planos (lean)', async () => {
      const cadena = mockConsulta();
      await reservaService.listar({}, { id: USUARIO, rol: 'admin' });

      expect(Reserva.find).toHaveBeenCalledWith({});
      expect(cadena.populate).toHaveBeenCalledWith('cancha', expect.any(String));
      expect(cadena.populate).toHaveBeenCalledWith('usuario', 'nombre email');
      expect(cadena.sort).toHaveBeenCalledWith({ fecha: 1, horaInicio: 1 });
      expect(cadena.lean).toHaveBeenCalled();
    });

    // ---- Regresión del bug de rendimiento: el listado SIEMPRE va paginado ----
    test('sin parámetros devuelve la página 1 con un máximo de 20 resultados', async () => {
      const cadena = mockConsulta([], 45);

      const resultado = await reservaService.listar({}, { id: USUARIO, rol: 'cliente' });

      expect(cadena.skip).toHaveBeenCalledWith(0);
      expect(cadena.limit).toHaveBeenCalledWith(20);
      expect(resultado).toMatchObject({ total: 45, pagina: 1, limite: 20, paginas: 3 });
    });

    test('calcula el desplazamiento según la página y el límite pedidos', async () => {
      const cadena = mockConsulta([], 45);

      const resultado = await reservaService.listar({ pagina: 3, limite: 10 }, { id: USUARIO, rol: 'cliente' });

      expect(cadena.skip).toHaveBeenCalledWith(20);
      expect(cadena.limit).toHaveBeenCalledWith(10);
      expect(resultado).toMatchObject({ pagina: 3, limite: 10, paginas: 5 });
    });

    test('devuelve los datos de la página y el total real, no el tamaño de la página', async () => {
      mockConsulta([{ _id: 'r1' }, { _id: 'r2' }], 120);
      const resultado = await reservaService.listar({}, { id: USUARIO, rol: 'cliente' });
      expect(resultado.data).toHaveLength(2);
      expect(resultado.total).toBe(120);
    });
  });

  describe('cancelar', () => {
    const reservaDe = (dueno, estado = 'pendiente') => ({
      usuario: { toString: () => dueno },
      estado,
      save: jest.fn().mockImplementation(function guardar() {
        return Promise.resolve(this);
      }),
    });

    test('el dueño puede cancelar su reserva', async () => {
      const reserva = reservaDe(USUARIO);
      Reserva.findById.mockResolvedValue(reserva);

      const resultado = await reservaService.cancelar('r1', { id: USUARIO, rol: 'cliente' });

      expect(resultado.estado).toBe('cancelada');
      expect(reserva.save).toHaveBeenCalled();
    });

    test('un admin puede cancelar la reserva de otro usuario', async () => {
      Reserva.findById.mockResolvedValue(reservaDe(OTRO_USUARIO));
      const resultado = await reservaService.cancelar('r1', { id: USUARIO, rol: 'admin' });
      expect(resultado.estado).toBe('cancelada');
    });

    test('lanza 403 si un cliente intenta cancelar la reserva de otro', async () => {
      const reserva = reservaDe(OTRO_USUARIO);
      Reserva.findById.mockResolvedValue(reserva);

      await expect(
        reservaService.cancelar('r1', { id: USUARIO, rol: 'cliente' })
      ).rejects.toMatchObject({ statusCode: 403 });
      expect(reserva.save).not.toHaveBeenCalled();
    });

    test('lanza 400 si la reserva ya estaba cancelada', async () => {
      Reserva.findById.mockResolvedValue(reservaDe(USUARIO, 'cancelada'));
      await expect(
        reservaService.cancelar('r1', { id: USUARIO, rol: 'cliente' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('lanza 404 si la reserva no existe', async () => {
      Reserva.findById.mockResolvedValue(null);
      await expect(
        reservaService.cancelar('r1', { id: USUARIO, rol: 'cliente' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
