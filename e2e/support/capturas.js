const fs = require('fs');
const path = require('path');

const CARPETA = path.join(__dirname, '..', 'capturas');

// Cada archivo de pruebas registra su driver en global.driver; si una prueba falla, se guarda una captura
afterEach(async () => {
  if (!global.__pruebaFallo || !global.driver) return;
  fs.mkdirSync(CARPETA, { recursive: true });
  const nombre = expect.getState().currentTestName.replace(/[^\w\-áéíóúñ ]/gi, '').replace(/\s+/g, '_').slice(0, 120);
  const imagen = await global.driver.takeScreenshot();
  fs.writeFileSync(path.join(CARPETA, `${nombre}.png`), imagen, 'base64');
});
