// SITMAH API - Configuración Routes para Vercel
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Modelo de Configuración
const ConfiguracionSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  valor: { type: String, required: true },
  descripcion: { type: String, default: '' },
  fechaActualizacion: { type: Date, default: Date.now }
});

const Configuracion = mongoose.model('Configuracion', ConfiguracionSchema);

// Conectar a MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};

// Obtener configuración por nombre
router.get('/:nombre', async (req, res) => {
  try {
    await connectDB();
    const config = await Configuracion.findOne({ nombre: req.params.nombre });
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuración', message: err.message });
  }
});

// Obtener todas las configuraciones
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const configs = await Configuracion.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuraciones', message: err.message });
  }
});

// Crear o actualizar configuración
router.post('/', async (req, res) => {
  try {
    await connectDB();
    const { nombre, valor, descripcion } = req.body;
    if (!nombre || !valor) {
      return res.status(400).json({ error: 'Nombre y valor son requeridos' });
    }

    const config = await Configuracion.findOneAndUpdate(
      { nombre },
      { 
        $set: { 
          valor, 
          descripcion: descripcion || '',
          fechaActualizacion: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar configuración', message: err.message });
  }
});

// Endpoint para inicializar configuración por defecto
router.post('/init', async (req, res) => {
  try {
    await connectDB();
    const configuraciones = [
      {
        nombre: 'temaGlobal',
        valor: 'normal',
        descripcion: 'Tema global de la aplicación (normal, sanvalentin, navidad, muertos)'
      },
      {
        nombre: 'version',
        valor: '1.0.2',
        descripcion: 'Versión actual del sistema'
      },
      {
        nombre: 'mantenimiento',
        valor: 'false',
        descripcion: 'Modo mantenimiento del sistema'
      }
    ];

    const resultados = [];
    
    for (const config of configuraciones) {
      const resultado = await Configuracion.findOneAndUpdate(
        { nombre: config.nombre },
        config,
        { upsert: true, new: true }
      );
      resultados.push(resultado);
    }

    res.json({
      message: 'Configuración inicializada correctamente v1.0.2',
      configuraciones: resultados
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al inicializar configuración', message: err.message });
  }
});

export default router; 