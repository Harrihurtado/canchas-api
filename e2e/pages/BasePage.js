const { By, Key, until } = require('selenium-webdriver');
const { Select } = require('selenium-webdriver/lib/select');
const config = require('../config');

/**
 * Clase base del Page Object Model.
 * Reúne las acciones comunes con ESPERAS EXPLÍCITAS: antes de usar un elemento,
 * se espera a que exista y sea visible. Las pruebas nunca usan localizadores ni el driver directamente.
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async visitar(ruta) {
    await this.driver.get(`${config.baseUrl}${ruta}`);
  }

  async buscar(localizador) {
    const elemento = await this.driver.wait(until.elementLocated(localizador), config.esperaMs, `No apareció ${localizador}`);
    await this.driver.wait(until.elementIsVisible(elemento), config.esperaMs, `${localizador} no se hizo visible`);
    return elemento;
  }

  async clic(localizador) {
    const elemento = await this.buscar(localizador);
    await this.driver.wait(until.elementIsEnabled(elemento), config.esperaMs);
    await elemento.click();
  }

  // Escribe reemplazando el contenido. No usa clear(): en Chrome, clear() borra el campo sin avisarle
  // a React, que vuelve a pintar el valor anterior y el texto nuevo queda pegado al final ("45000" + "50000").
  // Seleccionar todo y borrar con el teclado dispara los mismos eventos que una persona.
  async escribir(localizador, texto) {
    const elemento = await this.buscar(localizador);
    const teclaControl = process.platform === 'darwin' ? Key.COMMAND : Key.CONTROL;
    await elemento.sendKeys(Key.chord(teclaControl, 'a'), Key.BACK_SPACE);
    await elemento.sendKeys(texto);

    // Comprueba que el campo quedó exactamente con lo escrito (los campos de contraseña también tienen value)
    const valor = await elemento.getAttribute('value');
    if (valor !== String(texto)) {
      throw new Error(`El campo ${localizador} quedó con "${valor}" en vez de "${texto}"`);
    }
  }

  async texto(localizador) {
    return (await this.buscar(localizador)).getText();
  }

  async valor(localizador) {
    return (await this.buscar(localizador)).getAttribute('value');
  }

  async seleccionar(localizador, valor) {
    const select = new Select(await this.buscar(localizador));
    await select.selectByValue(valor);
  }

  // Cuenta coincidencias sin esperar: sirve para comprobar que algo NO está en pantalla
  async cantidad(localizador) {
    return (await this.driver.findElements(localizador)).length;
  }

  async existe(localizador) {
    return (await this.cantidad(localizador)) > 0;
  }

  async esperarTexto(localizador, texto) {
    const elemento = await this.buscar(localizador);
    await this.driver.wait(until.elementTextContains(elemento, texto), config.esperaMs, `${localizador} no llegó a decir "${texto}"`);
    return elemento.getText();
  }

  async esperarUrl(ruta) {
    await this.driver.wait(until.urlIs(`${config.baseUrl}${ruta}`), config.esperaMs, `La URL no llegó a ${ruta}`);
  }

  async rutaActual() {
    return (await this.driver.getCurrentUrl()).replace(config.baseUrl, '');
  }

  // Borra la sesión guardada en el navegador (token de localStorage)
  async limpiarSesion() {
    await this.visitar('/login');
    await this.driver.executeScript('window.localStorage.clear()');
  }
}

BasePage.By = By;
module.exports = BasePage;
