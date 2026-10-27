const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`MongoDB conectado: ${mongoose.connection.name} (${config.nodeEnv})`);
};

const disconnectDB = () => mongoose.disconnect();

module.exports = { connectDB, disconnectDB };
