const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config');

// Crea el navegador. Selenium Manager descarga solo el driver adecuado (chromedriver, geckodriver…).
async function crearDriver() {
  const builder = new Builder().forBrowser(config.navegador);

  if (config.navegador === 'firefox') {
    const opciones = new firefox.Options();
    if (config.headless) opciones.addArguments('-headless');
    if (process.env.FIREFOX_BIN) opciones.setBinary(process.env.FIREFOX_BIN);
    builder.setFirefoxOptions(opciones);
    if (process.env.GECKODRIVER) builder.setFirefoxService(new firefox.ServiceBuilder(process.env.GECKODRIVER));
  } else if (config.navegador === 'edge') {
    const opciones = new edge.Options();
    if (config.headless) opciones.addArguments('--headless=new');
    builder.setEdgeOptions(opciones);
  } else {
    const opciones = new chrome.Options().addArguments('--window-size=1366,900', '--lang=es-CO');
    if (config.headless) opciones.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
    builder.setChromeOptions(opciones);
  }

  const driver = await builder.build();
  await driver.manage().window().setRect({ width: 1366, height: 900 });
  // Sin esperas implícitas: todas las esperas son explícitas (until), así son predecibles
  await driver.manage().setTimeouts({ implicit: 0 });
  return driver;
}

module.exports = { crearDriver };
