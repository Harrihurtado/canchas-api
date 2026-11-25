const { TestEnvironment } = require('jest-environment-node');

// Entorno de Jest que avisa a las pruebas cuál falló, para tomarle captura de pantalla
class EntornoConCapturas extends TestEnvironment {
  async handleTestEvent(evento) {
    if (evento.name === 'test_start') this.global.__pruebaFallo = false;
    if (evento.name === 'test_fn_failure') this.global.__pruebaFallo = true;
  }
}

module.exports = EntornoConCapturas;
