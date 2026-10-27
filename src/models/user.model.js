const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

// Modelo mínimo para el Sprint 1. En el Sprint 2 se agrega password y autenticación.
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    email: { type: String, required: [true, 'El email es obligatorio'], unique: true, lowercase: true, trim: true },
    rol: { type: String, enum: ROLES, default: 'cliente' },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('User', userSchema);
