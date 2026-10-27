const config = require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/db');

const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
};

start();
