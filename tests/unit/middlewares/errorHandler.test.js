const errorHandler = require('../../../src/middlewares/errorHandler');
const notFound = require('../../../src/middlewares/notFound');
const AppError = require('../../../src/utils/AppError');

// res simulado: status() devuelve el mismo res para poder encadenar .json()
const crearRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware errorHandler', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => console.error.mockRestore());

  test('respeta el código y mensaje de un AppError', () => {
    const res = crearRes();
    errorHandler(new AppError('Cancha no encontrada', 404), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cancha no encontrada' });
  });

  test('incluye los detalles cuando el AppError los trae', () => {
    const res = crearRes();
    const detalles = [{ campo: 'email', mensaje: 'inválido' }];
    errorHandler(new AppError('Datos inválidos', 400, detalles), {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Datos inválidos', details: detalles });
  });

  test('convierte un CastError de Mongoose en 400', () => {
    const res = crearRes();
    errorHandler({ name: 'CastError', path: '_id' }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('convierte un ValidationError de Mongoose en 400 con detalle por campo', () => {
    const res = crearRes();
    const err = { name: 'ValidationError', errors: { precioHora: { path: 'precioHora', message: 'mínimo 0' } } };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].details).toEqual([{ campo: 'precioHora', mensaje: 'mínimo 0' }]);
  });

  test('convierte una clave duplicada (código 11000) en 409', () => {
    const res = crearRes();
    errorHandler({ code: 11000, keyValue: { email: 'a@a.com' } }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('convierte un JSON mal formado en 400', () => {
    const res = crearRes();
    errorHandler({ type: 'entity.parse.failed' }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('un error inesperado responde 500 sin exponer el stack fuera de desarrollo', () => {
    const res = crearRes();
    errorHandler(new Error('fallo interno'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).not.toHaveProperty('stack');
  });
});

describe('middleware notFound', () => {
  test('pasa un AppError 404 con el método y la ruta', () => {
    const next = jest.fn();
    notFound({ method: 'GET', originalUrl: '/api/nada' }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      message: 'Ruta no encontrada: GET /api/nada',
    }));
  });
});
