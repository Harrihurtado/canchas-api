const { crearDriver } = require('../support/driver');
const { crearCliente, unico } = require('../support/api');
const LoginPage = require('../pages/LoginPage');
const RegistroPage = require('../pages/RegistroPage');
const CatalogoPage = require('../pages/CatalogoPage');
const NavBar = require('../pages/NavBar');

describe('Autenticación (HU-18)', () => {
  let driver;
  let login;
  let registro;
  let navbar;

  beforeAll(async () => {
    driver = await crearDriver();
    global.driver = driver; // para las capturas de pantalla en caso de fallo
    login = new LoginPage(driver);
    registro = new RegistroPage(driver);
    navbar = new NavBar(driver);
  });

  afterAll(() => driver?.quit());

  beforeEach(() => login.limpiarSesion());

  test('@humo un visitante se registra, inicia sesión y ve su nombre', async () => {
    const usuario = { nombre: 'Laura Gómez', email: `e2e${unico()}@test.com`, password: 'Segura123' };

    await registro.abrir();
    await registro.registrar(usuario);

    await login.esperarUrl('/login');
    expect(await login.mensajeExito()).toBe('Tu cuenta está lista. Inicia sesión para reservar.');

    await login.iniciarSesion(usuario.email, usuario.password);
    await login.esperarUrl('/canchas');
    expect(await navbar.nombreUsuario()).toBe('Laura Gómez');
  });

  test('el registro con datos inválidos muestra cada error y no crea la cuenta', async () => {
    await registro.abrir();
    await registro.registrar({ nombre: '', email: 'no-es-un-correo', password: '123' });

    expect(await registro.mensajeError()).toContain('Revisa los datos del formulario');
    expect(await registro.erroresDetalle()).toEqual([
      'El nombre es obligatorio',
      'El correo no es válido',
      'La contraseña debe tener al menos 8 caracteres',
    ]);
    expect(await registro.rutaActual()).toBe('/registro');
  });

  test('el registro con un correo ya usado muestra el mensaje de la API', async () => {
    const existente = await crearCliente();

    await registro.abrir();
    await registro.registrar({ nombre: 'Otra persona', email: existente.email, password: 'Segura123' });

    expect(await registro.mensajeError()).toBe('El correo ya está registrado');
  });

  test('@humo con una contraseña incorrecta no entra y muestra un mensaje genérico', async () => {
    const cliente = await crearCliente();

    await login.abrir();
    await login.iniciarSesion(cliente.email, 'Incorrecta123');

    expect(await login.mensajeError()).toBe('Credenciales inválidas');
    expect(await login.rutaActual()).toBe('/login');
  });

  test('una página privada sin sesión lleva al login y, tras entrar, vuelve a esa página', async () => {
    const cliente = await crearCliente();

    await login.visitar('/mis-reservas');
    await login.esperarUrl('/login');

    await login.iniciarSesion(cliente.email, cliente.password);
    await login.esperarUrl('/mis-reservas');
  });

  test('al cerrar sesión ya no se puede volver a las páginas privadas', async () => {
    const cliente = await crearCliente();
    await login.entrarComo(cliente);

    await navbar.cerrarSesion();
    await login.visitar('/canchas');

    await login.esperarUrl('/login');
  });

  test('el enlace "Crea una gratis" lleva al registro', async () => {
    await login.abrir();
    await login.irARegistro();
    await login.esperarUrl('/registro');
  });

  test('la sesión se mantiene al recargar la página', async () => {
    const cliente = await crearCliente('Sesión Persistente');
    await login.entrarComo(cliente);

    await driver.navigate().refresh();

    const catalogo = new CatalogoPage(driver);
    await catalogo.esperarResultados();
    expect(await navbar.nombreUsuario()).toBe('Sesión Persistente');
  });
});
