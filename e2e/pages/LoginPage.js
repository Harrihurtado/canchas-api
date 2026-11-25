const BasePage = require('./BasePage');
const { By } = BasePage;

class LoginPage extends BasePage {
  static loc = {
    email: By.id('email'), // ID: la forma más estable y rápida
    password: By.id('password'),
    botonIngresar: By.id('btn-login'),
    error: By.id('login-error'),
    exitoRegistro: By.id('registro-exito'),
    // XPath por texto visible: útil cuando el elemento no tiene id
    enlaceRegistro: By.xpath("//a[normalize-space()='Crea una gratis']"),
  };

  abrir() { return this.visitar('/login'); }

  async iniciarSesion(email, password) {
    await this.escribir(LoginPage.loc.email, email);
    await this.escribir(LoginPage.loc.password, password);
    await this.clic(LoginPage.loc.botonIngresar);
  }

  // Inicia sesión desde cero y espera a que cargue la página de destino
  async entrarComo({ email, password }, destino = '/canchas') {
    await this.limpiarSesion();
    await this.abrir();
    await this.iniciarSesion(email, password);
    await this.esperarUrl(destino);
  }

  mensajeError() { return this.texto(LoginPage.loc.error); }
  mensajeExito() { return this.texto(LoginPage.loc.exitoRegistro); }
  irARegistro() { return this.clic(LoginPage.loc.enlaceRegistro); }
}

module.exports = LoginPage;
