const { crearDriver } = require('../support/driver');
const { crearCliente, crearCancha, desactivarCancha } = require('../support/api');
const LoginPage = require('../pages/LoginPage');
const CatalogoPage = require('../pages/CatalogoPage');
const ReservaPage = require('../pages/ReservaPage');
const MisReservasPage = require('../pages/MisReservasPage');

/**
 * Flujo completo de reservas. Las pruebas de este archivo se ejecutan en orden y comparten estado
 * (la reserva creada en una se usa en las siguientes), como lo viviría un usuario real.
 * Cada ejecución usa una cancha nueva, así los horarios nunca chocan con ejecuciones anteriores.
 */
describe('Reservas desde la interfaz (HU-20)', () => {
  let driver;
  let catalogo;
  let reserva;
  let misReservas;
  let cancha;

  beforeAll(async () => {
    driver = await crearDriver();
    global.driver = driver;
    catalogo = new CatalogoPage(driver);
    reserva = new ReservaPage(driver);
    misReservas = new MisReservasPage(driver);
    cancha = await crearCancha({ precioHora: 80000 });
    await new LoginPage(driver).entrarComo(await crearCliente());
  });

  afterAll(async () => {
    if (cancha) await desactivarCancha(cancha._id); // si la preparación falló, no hay nada que limpiar
    await driver?.quit();
  });

  const abrirReserva = async () => {
    await catalogo.abrir();
    await catalogo.reservar(cancha.nombre);
    expect(await reserva.titulo()).toBe(cancha.nombre);
  };

  test('@humo reserva una cancha y ve el total calculado (1,5 h × $80.000)', async () => {
    await abrirReserva();
    await reserva.elegirDia(2);
    await reserva.elegirHorario('18:00', '19:30');

    expect(await reserva.total()).toBe('$ 120.000');

    await reserva.confirmar();
    const mensaje = await reserva.mensajeExito();
    expect(mensaje).toContain('Reserva creada');
    expect(mensaje).toContain('de 18:00 a 19:30');
    expect(mensaje).toContain('Total: $ 120.000');
  });

  test('no permite reservar una franja que se cruza y conserva lo elegido', async () => {
    await abrirReserva();
    await reserva.elegirDia(2);
    await reserva.elegirHorario('18:30', '20:00');
    await reserva.confirmar();

    expect(await reserva.mensajeError()).toBe('La cancha ya está reservada de 18:00 a 19:30 en esa fecha');
    expect(await reserva.horaFinElegida()).toBe('20:00');
  });

  test('sí permite una franja contigua (19:30 a 20:30)', async () => {
    await abrirReserva();
    await reserva.elegirDia(2);
    await reserva.elegirHorario('19:30', '20:30');
    await reserva.confirmar();

    expect(await reserva.mensajeExito()).toContain('de 19:30 a 20:30');
  });

  test('avisa si la hora de fin no es posterior a la de inicio', async () => {
    await abrirReserva();
    await reserva.elegirHorario('20:00', '19:00');

    expect(await reserva.total()).toBe('$ 0');
    await reserva.confirmar();
    expect(await reserva.mensajeError()).toBe('La hora de fin debe ser posterior a la hora de inicio');
  });

  test('"Mis reservas" muestra las dos reservas pendientes', async () => {
    await misReservas.abrir();

    const reservas = await misReservas.reservasDe(cancha.nombre);
    expect(reservas).toHaveLength(2);
    expect(reservas.map((r) => r.estado)).toEqual(['Pendiente', 'Pendiente']);
  });

  test('responder "No" a la confirmación no cancela la reserva', async () => {
    await misReservas.abrir();
    await misReservas.cancelar(cancha.nombre, '18:00 a 19:30', { confirmar: false });

    const reservas = await misReservas.reservasDe(cancha.nombre);
    expect(reservas.find((r) => r.horario.includes('18:00')).estado).toBe('Pendiente');
  });

  test('@humo cancela una reserva tras confirmar', async () => {
    await misReservas.abrir();
    await misReservas.cancelar(cancha.nombre, '18:00 a 19:30');

    expect(await misReservas.mensaje()).toBe(`Cancelaste la reserva de ${cancha.nombre}`);
    const reservas = await misReservas.reservasDe(cancha.nombre);
    expect(reservas.find((r) => r.horario.includes('18:00')).estado).toBe('Cancelada');
  });

  test('la franja cancelada vuelve a quedar disponible', async () => {
    await abrirReserva();
    await reserva.elegirDia(2);
    await reserva.elegirHorario('18:00', '19:30');
    await reserva.confirmar();

    expect(await reserva.mensajeExito()).toContain('Reserva creada');
  });
});
