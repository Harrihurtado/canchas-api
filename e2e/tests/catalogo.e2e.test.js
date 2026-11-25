const { crearDriver } = require('../support/driver');
const { crearCliente, crearCancha, desactivarCancha } = require('../support/api');
const LoginPage = require('../pages/LoginPage');
const CatalogoPage = require('../pages/CatalogoPage');

describe('Catálogo de canchas (HU-19)', () => {
  let driver;
  let catalogo;
  let canchaTenis;

  beforeAll(async () => {
    driver = await crearDriver();
    global.driver = driver;
    catalogo = new CatalogoPage(driver);
    canchaTenis = await crearCancha({ deporte: 'tenis', superficie: 'cemento', precioHora: 45000, capacidad: 4 });
    await new LoginPage(driver).entrarComo(await crearCliente());
  });

  afterAll(async () => {
    if (canchaTenis) await desactivarCancha(canchaTenis._id); // si la preparación falló, no hay nada que limpiar
    await driver?.quit();
  });

  beforeEach(() => catalogo.abrir());

  test('@humo muestra las canchas activas con su información y precio', async () => {
    expect(await catalogo.nombresDeCanchas()).toContain(canchaTenis.nombre);

    const tarjeta = await catalogo.textoTarjeta(canchaTenis.nombre);
    expect(tarjeta).toContain('Tenis');
    expect(tarjeta).toContain('Sede Pruebas');
    expect(tarjeta).toContain('Cemento');
    expect(tarjeta).toContain('4 jugadores');
    expect(tarjeta.replace(/\s/g, ' ')).toContain('$ 45.000');
  });

  test('el filtro por deporte deja solo canchas de ese deporte', async () => {
    await catalogo.filtrarPor('tenis');

    const deportes = await catalogo.deportesVisibles();
    expect(deportes.length).toBeGreaterThan(0);
    expect(new Set(deportes)).toEqual(new Set(['tenis']));
    expect(await catalogo.nombresDeCanchas()).toContain(canchaTenis.nombre);
  });

  test('un deporte sin canchas muestra el aviso y permite volver a ver todas', async () => {
    await catalogo.filtrarPor('futbol11'); // los datos de prueba no tienen canchas de fútbol 11

    expect(await catalogo.muestraVacio()).toBe(true);

    await catalogo.verTodas();
    await catalogo.esperarResultados();
    expect(await catalogo.nombresDeCanchas()).toContain(canchaTenis.nombre);
  });

  test('el contador coincide con las tarjetas mostradas', async () => {
    const cantidad = (await catalogo.nombresDeCanchas()).length;
    expect(await catalogo.conteo()).toBe(`${cantidad} ${cantidad === 1 ? 'cancha disponible' : 'canchas disponibles'}`);
  });

  test('una cancha desactivada no aparece en el catálogo', async () => {
    const temporal = await crearCancha();
    await catalogo.abrir();
    expect(await catalogo.tieneCancha(temporal.nombre)).toBe(true);

    await desactivarCancha(temporal._id);
    await catalogo.abrir();

    expect(await catalogo.tieneCancha(temporal.nombre)).toBe(false);
  });
});
