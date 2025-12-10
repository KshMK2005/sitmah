import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  valor: { type: String, required: true },
  descripcion: { type: String },
  fechaActualizacion: { type: Date, default: Date.now }
});

export default mongoose.model('Configuracion', configuracionSchema); 