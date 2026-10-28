// Se ejecuta antes de cada archivo de pruebas.
// Carga .env.test si existe y define valores por defecto para que las pruebas
// también corran en GitHub Actions, donde no existe ningún archivo .env.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test'), quiet: true });

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/canchas_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_solo_para_pruebas';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
