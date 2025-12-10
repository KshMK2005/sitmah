import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar rutas
import programacionRoutes from './routes/programacionRoutes.js';
import aperturaRoutes from './routes/aperturaRoutes.js';
import operadorRoutes from './routes/operadorRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import configuracionRoutes from './routes/configuracionRoutes.js';

// FORZAR REINICIO DEL SERVIDOR - BYPASS TOTAL DE VALIDACIONES DE HORA - v3.0
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Rutas
app.use('/api/programacion', programacionRoutes);
app.use('/api/apertura', aperturaRoutes);
app.use('/api/operadores', operadorRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente - Modelo actualizado' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log('📋 Modelo Apertura actualizado con ORION y estado apertura');
}); 