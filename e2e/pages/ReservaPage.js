const BasePage = require('./BasePage');
const { By } = BasePage;

class ReservaPage extends BasePage {
  static loc = {
    titulo: By.id('cancha-titulo'),
    dias: By.css('#fecha .dia'),
    dia: (posicion) => By.css(`#fecha .dia:nth-child(${posicion})`), // CSS con pseudo-clase
    horaInicio: By.id('hora-inicio'),
    horaFin: By.id('hora-fin'),
    total: By.id('total-estimado'),
    confirmar: By.id('btn-confirmar'),
    exito: By.id('reserva-exito'),
    error: By.id('reserva-error'),
    verMisReservas: By.xpath("//div[@id='reserva-exito']//a[normalize-space()='Ver mis reservas']"),
  };

  titulo() { return this.texto(ReservaPage.loc.titulo); }

  // Elige el día por su posición en el calendario (1 = mañana) y devuelve la fecha ISO
  async elegirDia(posicion) {
    const boton = await this.buscar(ReservaPage.loc.dia(posicion));
    await boton.click();
    return boton.getAttribute('data-fecha');
  }

  async elegirHorario(inicio, fin) {
    await this.seleccionar(ReservaPage.loc.horaInicio, inicio);
    await this.seleccionar(ReservaPage.loc.horaFin, fin);
  }

  async total() {
    return (await this.texto(ReservaPage.loc.total)).replace(/\s/g, ' ');
  }

  confirmar() { return this.clic(ReservaPage.loc.confirmar); }

  async mensajeExito() {
    return (await this.texto(ReservaPage.loc.exito)).replace(/\s/g, ' ');
  }

  mensajeError() { return this.texto(ReservaPage.loc.error); }
  horaFinElegida() { return this.valor(ReservaPage.loc.horaFin); }
  irAMisReservas() { return this.clic(ReservaPage.loc.verMisReservas); }
}

module.exports = ReservaPage;
