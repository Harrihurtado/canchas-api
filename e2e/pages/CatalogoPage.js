const BasePage = require('./BasePage');
const config = require('../config');
const { By } = BasePage;

class CatalogoPage extends BasePage {
  static loc = {
    lista: By.id('lista-canchas'),
    cargando: By.id('catalogo-cargando'),
    vacio: By.id('catalogo-vacio'),
    conteo: By.id('conteo-canchas'),
    tarjetas: By.css('.cancha-card'), // CSS por clase: todas las tarjetas
    nombres: By.css('.cancha-card .cancha-nombre'),
    verTodas: By.xpath("//div[@id='catalogo-vacio']//button[normalize-space()='Ver todas las canchas']"),
    filtro: (deporte) => By.id(`filtro-${deporte || 'todas'}`),
    // XPath: sube desde el nombre de la cancha hasta su tarjeta y baja a su botón "Reservar"
    reservar: (nombre) => By.xpath(`//h3[normalize-space()='${nombre}']/ancestor::article//a[normalize-space()='Reservar']`),
    tarjetaDe: (nombre) => By.xpath(`//article[.//h3[normalize-space()='${nombre}']]`),
  };

  async abrir() {
    await this.visitar('/canchas');
    await this.esperarResultados();
  }

  // Espera a que termine la carga: hay lista o hay mensaje de vacío
  async esperarResultados() {
    await this.driver.wait(
      async () => !(await this.existe(CatalogoPage.loc.cargando))
        && ((await this.existe(CatalogoPage.loc.lista)) || (await this.existe(CatalogoPage.loc.vacio))),
      config.esperaMs,
      'El catálogo no terminó de cargar'
    );
  }

  async filtrarPor(deporte) {
    await this.clic(CatalogoPage.loc.filtro(deporte));
    await this.driver.wait(
      async () => (await (await this.buscar(CatalogoPage.loc.filtro(deporte))).getAttribute('aria-pressed')) === 'true',
      config.esperaMs
    );
    await this.esperarResultados();
  }

  async nombresDeCanchas() {
    const elementos = await this.driver.findElements(CatalogoPage.loc.nombres);
    return Promise.all(elementos.map((e) => e.getText()));
  }

  async deportesVisibles() {
    const tarjetas = await this.driver.findElements(CatalogoPage.loc.tarjetas);
    return Promise.all(tarjetas.map((t) => t.getAttribute('data-deporte')));
  }

  muestraVacio() { return this.existe(CatalogoPage.loc.vacio); }
  conteo() { return this.texto(CatalogoPage.loc.conteo); }
  verTodas() { return this.clic(CatalogoPage.loc.verTodas); }
  tieneCancha(nombre) { return this.existe(CatalogoPage.loc.tarjetaDe(nombre)); }
  textoTarjeta(nombre) { return this.texto(CatalogoPage.loc.tarjetaDe(nombre)); }
  reservar(nombre) { return this.clic(CatalogoPage.loc.reservar(nombre)); }
}

module.exports = CatalogoPage;
