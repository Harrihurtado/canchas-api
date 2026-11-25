const BasePage = require('./BasePage');
const config = require('../config');
const { By } = BasePage;
const { until } = require('selenium-webdriver');

class AdminCanchasPage extends BasePage {
  static loc = {
    lista: By.id('tabla-canchas'),
    nuevaCancha: By.id('btn-nueva-cancha'),
    nombre: By.id('cancha-nombre'),
    deporte: By.id('cancha-deporte'),
    superficie: By.id('cancha-superficie'),
    precio: By.id('cancha-precio'),
    capacidad: By.id('cancha-capacidad'),
    ubicacion: By.id('cancha-ubicacion'),
    guardar: By.id('btn-guardar-cancha'),
    descartar: By.id('btn-cancelar-cancha'),
    error: By.id('cancha-form-error'),
    erroresDetalle: By.css('#cancha-form-error li'),
    mensaje: By.id('admin-mensaje'),
    filaDe: (nombre) => By.xpath(`//li[contains(@class,'admin-cancha-fila')][.//p[@class='admin-nombre' and normalize-space()='${nombre}']]`),
    precioFila: By.css('.admin-precio'),
    editar: By.css('.btn-editar'),
    desactivar: By.css('.btn-desactivar'),
    confirmarDesactivar: By.css('.btn-confirmar-desactivar'),
  };

  async abrir() {
    await this.visitar('/admin/canchas');
    await this.buscar(AdminCanchasPage.loc.lista);
  }

  async llenarFormulario({ nombre, deporte, superficie, precioHora, capacidad, ubicacion }) {
    if (nombre !== undefined) await this.escribir(AdminCanchasPage.loc.nombre, nombre);
    if (deporte) await this.seleccionar(AdminCanchasPage.loc.deporte, deporte);
    if (superficie) await this.seleccionar(AdminCanchasPage.loc.superficie, superficie);
    if (precioHora !== undefined) await this.escribir(AdminCanchasPage.loc.precio, String(precioHora));
    if (capacidad !== undefined) await this.escribir(AdminCanchasPage.loc.capacidad, String(capacidad));
    if (ubicacion !== undefined) await this.escribir(AdminCanchasPage.loc.ubicacion, ubicacion);
  }

  async crearCancha(datos) {
    await this.clic(AdminCanchasPage.loc.nuevaCancha);
    await this.llenarFormulario(datos);
    await this.clic(AdminCanchasPage.loc.guardar);
  }

  // Edita el precio y espera a que la lista, recargada desde la API, muestre el valor nuevo
  async editarPrecio(nombre, precio) {
    const fila = await this.buscar(AdminCanchasPage.loc.filaDe(nombre));
    await fila.findElement(AdminCanchasPage.loc.editar).click();
    await this.escribir(AdminCanchasPage.loc.precio, String(precio));
    await this.clic(AdminCanchasPage.loc.guardar);
    await this.esperarTexto(AdminCanchasPage.loc.mensaje, 'Guardaste');
    try {
      await this.driver.wait(
        async () => (await this.precioDe(nombre).catch(() => '')).replace(/\D/g, '') === String(precio),
        config.esperaMs
      );
    } catch {
      // Mensaje con el valor que realmente quedó, para diagnosticar rápido
      throw new Error(`El precio de ${nombre} no llegó a ${precio}; la lista muestra "${await this.precioDe(nombre).catch(() => '?')}"`);
    }
  }

  // Desactiva y espera a que la cancha salga de la lista (until.stalenessOf: su fila deja de existir)
  async desactivar(nombre) {
    const fila = await this.buscar(AdminCanchasPage.loc.filaDe(nombre));
    await fila.findElement(AdminCanchasPage.loc.desactivar).click();
    await fila.findElement(AdminCanchasPage.loc.confirmarDesactivar).click();
    await this.esperarTexto(AdminCanchasPage.loc.mensaje, 'Desactivaste');
    await this.driver.wait(until.stalenessOf(fila), config.esperaMs, `${nombre} sigue en la lista`);
  }

  descartar() { return this.clic(AdminCanchasPage.loc.descartar); }
  mensaje() { return this.texto(AdminCanchasPage.loc.mensaje); }
  mensajeError() { return this.texto(AdminCanchasPage.loc.error); }

  async erroresDetalle() {
    await this.buscar(AdminCanchasPage.loc.error);
    const items = await this.driver.findElements(AdminCanchasPage.loc.erroresDetalle);
    return Promise.all(items.map((li) => li.getText()));
  }

  tieneCancha(nombre) { return this.existe(AdminCanchasPage.loc.filaDe(nombre)); }

  async precioDe(nombre) {
    const fila = await this.buscar(AdminCanchasPage.loc.filaDe(nombre));
    return (await fila.findElement(AdminCanchasPage.loc.precioFila).getText()).replace(/\s/g, ' ');
  }
}

module.exports = AdminCanchasPage;
