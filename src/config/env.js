const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

// Carga .env.development, .env.test o .env.production según el entorno
dotenv.config({ path: path.resolve(process.cwd(), `.env.${NODE_ENV}`), quiet: true });

['MONGODB_URI', 'JWT_SECRET'].forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Falta ${variable} en .env.${NODE_ENV}`);
  }
});

module.exports = {
  nodeEnv: NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
