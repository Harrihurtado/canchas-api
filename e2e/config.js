// Configuración de las pruebas de UI. Todo se puede cambiar con variables de entorno.
module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  navegador: process.env.BROWSER || 'chrome', // chrome | firefox | edge
  headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
  esperaMs: Number(process.env.ESPERA_MS || 10000), // tiempo máximo de las esperas explícitas
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@canchaya.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
};
