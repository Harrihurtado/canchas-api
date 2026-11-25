const BasePage = require('./BasePage');
const { By } = BasePage;

// Componente compartido por las páginas privadas: la barra superior
class NavBar extends BasePage {
  static loc = {
    nombreUsuario: By.id('usuario-nombre'),
    insigniaAdmin: By.id('usuario-rol'),
    menuReservas: By.id('nav-reservas'),
    menuAdmin: By.id('nav-admin'),
    menuCanchas: By.id('nav-canchas'),
    cerrarSesion: By.id('btn-logout'),
  };

  nombreUsuario() { return this.texto(NavBar.loc.nombreUsuario); }
  insigniaAdmin() { return this.texto(NavBar.loc.insigniaAdmin); }
  tieneMenuAdmin() { return this.existe(NavBar.loc.menuAdmin); }
  irACanchas() { return this.clic(NavBar.loc.menuCanchas); }
  irAReservas() { return this.clic(NavBar.loc.menuReservas); }
  irAAdmin() { return this.clic(NavBar.loc.menuAdmin); }

  async cerrarSesion() {
    await this.clic(NavBar.loc.cerrarSesion);
    await this.esperarUrl('/login');
  }
}

module.exports = NavBar;
