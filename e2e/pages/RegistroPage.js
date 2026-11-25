const BasePage = require('./BasePage');
const { By } = BasePage;

class RegistroPage extends BasePage {
  static loc = {
    nombre: By.id('nombre'),
    email: By.id('email'),
    password: By.id('password'),
    telefono: By.id('telefono'),
    botonCrear: By.id('btn-registrar'),
    error: By.id('registro-error'),
    erroresDetalle: By.css('#registro-error li'), // CSS: cada error del formulario
  };

  abrir() { return this.visitar('/registro'); }

  async registrar({ nombre = '', email = '', password = '', telefono = '' }) {
    await this.escribir(RegistroPage.loc.nombre, nombre);
    await this.escribir(RegistroPage.loc.email, email);
    await this.escribir(RegistroPage.loc.password, password);
    if (telefono) await this.escribir(RegistroPage.loc.telefono, telefono);
    await this.clic(RegistroPage.loc.botonCrear);
  }

  mensajeError() { return this.texto(RegistroPage.loc.error); }

  async erroresDetalle() {
    await this.buscar(RegistroPage.loc.error);
    const items = await this.driver.findElements(RegistroPage.loc.erroresDetalle);
    return Promise.all(items.map((li) => li.getText()));
  }
}

module.exports = RegistroPage;
