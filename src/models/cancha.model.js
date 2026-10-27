const mongoose = require('mongoose');
const { DEPORTES, SUPERFICIES } = require('../utils/constants');

const canchaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, unique: true },
    deporte: { type: String, required: [true, 'El deporte es obligatorio'], enum: DEPORTES },
    superficie: { type: String, enum: SUPERFICIES, default: 'sintetica' },
    precioHora: { type: Number, required: [true, 'El precio por hora es obligatorio'], min: 0 },
    capacidad: { type: Number, required: [true, 'La capacidad es obligatoria'], min: 2 },
    ubicacion: { type: String, required: [true, 'La ubicación es obligatoria'], trim: true },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Cancha', canchaSchema);
