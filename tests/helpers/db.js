// Utilidades de base de datos para las pruebas de integración.
const mongoose = require('mongoose');
const config = require('../../src/config/env');

// Se cargan los modelos para poder crear sus índices (ej. email único)
require('../../src/models/user.model');
require('../../src/models/cancha.model');
require('../../src/models/reserva.model');

const conectar = async () => {
  await mongoose.connect(config.mongoUri);

  // Protección: estas pruebas BORRAN datos. Solo se permite en una BD de pruebas.
  const nombreBD = mongoose.connection.name;
  if (config.nodeEnv !== 'test' || !nombreBD.includes('test')) {
    await mongoose.disconnect();
    throw new Error(`Pruebas abortadas: la base "${nombreBD}" no es de pruebas (debe contener "test")`);
  }

  await Promise.all(Object.values(mongoose.models).map((modelo) => modelo.init()));
};

const limpiar = async () => {
  const colecciones = Object.values(mongoose.connection.collections);
  await Promise.all(colecciones.map((coleccion) => coleccion.deleteMany({})));
};

const desconectar = () => mongoose.disconnect();

module.exports = { conectar, limpiar, desconectar };
