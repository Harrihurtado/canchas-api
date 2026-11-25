const BasePage = require('./BasePage');
const config = require('../config');
const { By } = BasePage;

class MisReservasPage extends BasePage {
  static loc = {
    titulo: By.css('.mis-reservas h1'),
    lista: By.id('lista-reservas'),
    vacio: By.id('reservas-vacio'),
    mensaje: By.id('reservas-mensaje'),
    // XPath: filas de una cancha concreta (cada <li> que contiene ese nombre)
    filasDe: (cancha) => By.xpath(`//li[contains(@class,'reserva-fila')][.//p[contains(@class,'reserva-cancha') and normalize-space()='${cancha}']]`),
    estado: By.css('.estado'),
    horario: By.css('.reserva-detalle'),
    cancelar: By.css('.btn-cancelar'),
    confirmarCancelacion: By.css('.btn-confirmar-cancelacion'),
    mantener: By.css('.btn-mantener'),
  };

  async abrir() {
    await this.visitar('/mis-reservas');
    await this.esperarCarga();
  }

  async esperarCarga() {
    await this.driver.wait(
      async () => (await this.existe(MisReservasPage.loc.lista)) || (await this.existe(MisReservasPage.loc.vacio)),
      config.esperaMs,
      'Mis reservas no terminó de cargar'
    );
  }

  titulo() { return this.texto(MisReservasPage.loc.titulo); }

  // Devuelve [{ horario, estado }] de las reservas de una cancha
  async reservasDe(cancha) {
    const filas = await this.driver.findElements(MisReservasPage.loc.filasDe(cancha));
    return Promise.all(
      filas.map(async (fila) => ({
        horario: await fila.findElement(MisReservasPage.loc.horario).getText(),
        estado: await fila.findElement(MisReservasPage.loc.estado).getText(),
      }))
    );
  }

  async filaDe(cancha, horario) {
    const filas = await this.driver.findElements(MisReservasPage.loc.filasDe(cancha));
    for (const fila of filas) {
      if ((await fila.findElement(MisReservasPage.loc.horario).getText()).includes(horario)) return fila;
    }
    throw new Error(`No hay reserva de ${cancha} con horario ${horario}`);
  }

  // Espera a que la reserva de esa cancha y horario muestre el estado indicado.
  // La lista se vuelve a pedir a la API después del mensaje: hay que esperar el efecto, no el mensaje.
  async esperarEstado(cancha, horario, estado) {
    await this.driver.wait(
      async () => {
        const reservas = await this.reservasDe(cancha).catch(() => []); // la lista puede redibujarse mientras se lee
        return reservas.find((r) => r.horario.includes(horario))?.estado === estado;
      },
      config.esperaMs,
      `La reserva de ${cancha} (${horario}) no llegó al estado "${estado}"`
    );
  }

  // Cancela una reserva respondiendo "Sí" o "No" a la confirmación, y espera su efecto en la lista
  async cancelar(cancha, horario, { confirmar = true } = {}) {
    const fila = await this.filaDe(cancha, horario);
    await fila.findElement(MisReservasPage.loc.cancelar).click();
    const boton = confirmar ? MisReservasPage.loc.confirmarCancelacion : MisReservasPage.loc.mantener;
    await fila.findElement(boton).click();
    if (confirmar) {
      await this.esperarTexto(MisReservasPage.loc.mensaje, 'Cancelaste');
      await this.esperarEstado(cancha, horario, 'Cancelada');
    } else {
      // Al responder "No", vuelve a aparecer el botón Cancelar en esa fila
      await this.driver.wait(
        async () => (await (await this.filaDe(cancha, horario)).findElements(MisReservasPage.loc.cancelar)).length === 1,
        config.esperaMs
      );
    }
  }

  mensaje() { return this.texto(MisReservasPage.loc.mensaje); }
}

module.exports = MisReservasPage;
