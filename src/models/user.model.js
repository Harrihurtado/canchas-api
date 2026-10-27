const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    email: { type: String, required: [true, 'El email es obligatorio'], unique: true, lowercase: true, trim: true },
    // select: false -> la contraseña NUNCA viene en las consultas, salvo que se pida con +password
    password: { type: String, required: [true, 'La contraseña es obligatoria'], minlength: 8, select: false },
    telefono: { type: String, trim: true },
    rol: { type: String, enum: ROLES, default: 'cliente' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password; // doble seguro: nunca se envía en una respuesta
        return ret;
      },
    },
  }
);

// Cifra la contraseña antes de guardar (solo si cambió)
userSchema.pre('save', async function cifrarPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.compararPassword = function compararPassword(passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model('User', userSchema);
