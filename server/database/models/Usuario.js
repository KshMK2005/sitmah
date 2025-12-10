import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: ['programador', 'apertura', 'verificador', 'dashboard', 'administrador'],
    required: true
  },
  tarjeton: { type: String },
  correo: { type: String },
  tema: { type: String, default: 'normal' }
});

export default mongoose.model('Usuario', usuarioSchema);
