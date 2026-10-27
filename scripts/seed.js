// Carga datos de ejemplo. Uso: npm run seed
const mongoose = require('mongoose');
const config = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/user.model');
const Cancha = require('../src/models/cancha.model');
const Reserva = require('../src/models/reserva.model');

const seed = async () => {
  if (config.nodeEnv === 'production') {
    throw new Error('El seed no se ejecuta en producción');
  }
  await connectDB();

  await Promise.all([Reserva.deleteMany(), Cancha.deleteMany(), User.deleteMany()]);

  const [cliente, admin] = await User.create([
    { nombre: 'Cliente Demo', email: 'cliente@canchaya.com', password: 'Cliente123!', rol: 'cliente' },
    { nombre: 'Admin Demo', email: 'admin@canchaya.com', password: 'Admin123!', rol: 'admin' },
  ]);

  const canchas = await Cancha.create([
    { nombre: 'La Bombonera', deporte: 'futbol5', superficie: 'sintetica', precioHora: 80000, capacidad: 10, ubicacion: 'Sede Norte' },
    { nombre: 'El Campín Mini', deporte: 'futbol8', superficie: 'sintetica', precioHora: 120000, capacidad: 16, ubicacion: 'Sede Sur' },
    { nombre: 'Arena Voley', deporte: 'voleibol', superficie: 'natural', precioHora: 50000, capacidad: 12, ubicacion: 'Sede Norte' },
    { nombre: 'Coliseo Central', deporte: 'baloncesto', superficie: 'madera', precioHora: 90000, capacidad: 10, ubicacion: 'Sede Centro' },
  ]);

  console.log('\nDatos cargados. Copia estos IDs para tus pruebas:');
  console.log(`  Cliente: ${cliente._id}  (cliente@canchaya.com / Cliente123!)`);
  console.log(`  Admin:   ${admin._id}  (admin@canchaya.com / Admin123!)`);
  canchas.forEach((c) => console.log(`  Cancha "${c.nombre}" (${c.deporte}): ${c._id}`));
};

seed()
  .catch((err) => {
    console.error('Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
