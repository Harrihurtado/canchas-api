const mongoose = require('mongoose');
const { ESTADOS_RESERVA, HORA_REGEX } = require('../utils/constants');

const reservaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cancha: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancha', required: true },
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true, match: HORA_REGEX },
    horaFin: { type: String, required: true, match: HORA_REGEX },
    total: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ESTADOS_RESERVA, default: 'pendiente' },
  },
  { timestamps: true, versionKey: false }
);

// Acelera la búsqueda de cruces de horario
reservaSchema.index({ cancha: 1, fecha: 1 });

module.exports = mongoose.model('Reserva', reservaSchema);
