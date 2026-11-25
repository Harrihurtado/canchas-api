const { crearDriver } = require('../support/driver');
const { crearCliente, unico } = require('../support/api');
const config = require('../config');
const LoginPage = require('../pages/LoginPage');
const NavBar = require('../pages/NavBar');
const CatalogoPage = require('../pages/CatalogoPage');
const AdminCanchasPage = require('../pages/AdminCanchasPage');

describe('Panel de administración (HU-30)', () => {
  let driver;
  let login;
  let navbar;
  let admin;
  let catalogo;

  beforeAll(async () => {
    driver = await crearDriver();
    global.driver = driver;
    login = new LoginPage(driver);
    navbar = new NavBar(driver);
    admin = new AdminCanchasPage(driver);
    catalogo = new CatalogoPage(driver);
  });

  afterAll(() => driver?.quit());

  describe('como cliente', () => {
    beforeAll(async () => login.entrarComo(await crearCliente()));

    test('no ve el menú "Administrar"', async () => {
      await catalogo.esperarResultados();
      expect(await navbar.tieneMenuAdmin()).toBe(false);
    });

    test('si escribe la dirección del panel, vuelve al catálogo', async () => {
      await admin.visitar('/admin/canchas');
      await admin.esperarUrl('/canchas');
    });
  });

  describe('como administrador', () => {
    const nombre = `Tenis Club ${unico()}`;

    beforeAll(() => login.entrarComo(config.admin));

    test('ve su insignia y entra al panel desde el menú', async () => {
      expect(await navbar.insigniaAdmin()).toBe('Admin');
      await navbar.irAAdmin();
      await admin.esperarUrl('/admin/canchas');
    });

    test('un formulario vacío muestra qué falta', async () => {
      await admin.abrir();
      await admin.crearCancha({});

      expect(await admin.mensajeError()).toContain('Revisa los datos de la cancha');
      expect(await admin.erroresDetalle()).toEqual(expect.arrayContaining([
        'El nombre es obligatorio',
        'La ubicación es obligatoria',
      ]));
      await admin.descartar();
    });

    test('@humo crea una cancha y aparece en el catálogo para reservar', async () => {
      await admin.abrir();
      await admin.crearCancha({ nombre, deporte: 'tenis', superficie: 'cemento', precioHora: 45000, capacidad: 4, ubicacion: 'Sede Sur' });

      expect(await admin.mensaje()).toBe(`Creaste la cancha ${nombre}`);
      expect(await admin.precioDe(nombre)).toContain('$ 45.000');

      await catalogo.abrir();
      expect(await catalogo.tieneCancha(nombre)).toBe(true);
    });

    test('no permite dos canchas con el mismo nombre', async () => {
      await admin.abrir();
      await admin.crearCancha({ nombre, precioHora: 1000, capacidad: 2, ubicacion: 'Otra sede' });

      expect(await admin.mensajeError()).toBe(`Ya existe una cancha llamada "${nombre}". Usa otro nombre.`);
      await admin.descartar();
    });

    test('edita el precio por hora', async () => {
      await admin.abrir();
      await admin.editarPrecio(nombre, 50000);

      expect(await admin.precioDe(nombre)).toContain('$ 50.000');
    });

    test('desactiva la cancha y deja de aparecer en el catálogo', async () => {
      await admin.abrir();
      await admin.desactivar(nombre);

      expect(await admin.tieneCancha(nombre)).toBe(false);
      await catalogo.abrir();
      expect(await catalogo.tieneCancha(nombre)).toBe(false);
    });
  });
});
