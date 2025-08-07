// SITMAH API - Vercel Functions
// Este archivo maneja las peticiones de API en Vercel

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('=== INICIO CONEXIÓN MONGODB ===');
    console.log('Intentando conectar a MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Definida' : 'No definida');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado exitosamente');
    console.log('=== FIN CONEXIÓN MONGODB ===');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

// Importar modelos
import Usuario from '../server/database/models/Usuario.js';
import Apertura from '../server/database/models/Apertura.js';
import Programacion from '../server/database/models/Programacion.js';
import Operador from '../server/database/models/Operador.js';

// Rutas básicas
app.get('/api', (req, res) => {
  res.json({ message: 'API de SITMAH funcionando en Vercel v1.0.1' });
});

// Rutas de usuarios
app.get('/api/usuarios/admin', async (req, res) => {
  try {
    const admin = await Usuario.findOne({ rol: 'administrador' });
    res.json(admin || { message: 'No hay administrador' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar usuario por nombre de usuario
app.get('/api/usuarios/:usuario', async (req, res) => {
  try {
    console.log('=== INICIO BÚSQUEDA USUARIO ===');
    console.log('Buscando usuario:', req.params.usuario);
    
    // Verificar conexión a MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB no está conectado. Estado:', mongoose.connection.readyState);
      await connectDB();
    }
    
    const usuario = await Usuario.findOne({ usuario: req.params.usuario });
    console.log('Usuario encontrado:', usuario ? 'SÍ' : 'NO');
    
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    console.log('=== FIN BÚSQUEDA USUARIO ===');
    res.json(usuario);
  } catch (error) {
    console.error('Error buscando usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de operadores
app.get('/api/operadores', async (req, res) => {
  try {
    const operadores = await Operador.find();
    res.json(operadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/operadores/buscar/:tarjeton', async (req, res) => {
  try {
    const operador = await Operador.findOne({ tarjeton: req.params.tarjeton });
    res.json(operador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de aperturas
app.get('/api/apertura', async (req, res) => {
  try {
    const aperturas = await Apertura.find();
    res.json(aperturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apertura', async (req, res) => {
  try {
    const apertura = new Apertura(req.body);
    await apertura.save();
    res.status(201).json(apertura);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar apertura por ID
app.put('/api/apertura/:id', async (req, res) => {
  try {
    console.log('Actualizando apertura:', req.params.id);
    console.log('Datos a actualizar:', req.body);
    
    const apertura = await Apertura.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!apertura) {
      return res.status(404).json({ error: 'Apertura no encontrada' });
    }
    
    console.log('Apertura actualizada:', apertura);
    res.json(apertura);
  } catch (error) {
    console.error('Error actualizando apertura:', error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar apertura por ID
app.delete('/api/apertura/:id', async (req, res) => {
  try {
    console.log('Eliminando apertura:', req.params.id);
    
    const apertura = await Apertura.findByIdAndDelete(req.params.id);
    
    if (!apertura) {
      return res.status(404).json({ error: 'Apertura no encontrada' });
    }
    
    console.log('Apertura eliminada:', apertura);
    res.json({ message: 'Apertura eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando apertura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener apertura por ID
app.get('/api/apertura/:id', async (req, res) => {
  try {
    console.log('Buscando apertura:', req.params.id);
    
    const apertura = await Apertura.findById(req.params.id);
    
    if (!apertura) {
      return res.status(404).json({ error: 'Apertura no encontrada' });
    }
    
    console.log('Apertura encontrada:', apertura);
    res.json(apertura);
  } catch (error) {
    console.error('Error buscando apertura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar retrasos automáticamente
app.get('/api/apertura/verificar-retrasos', async (req, res) => {
  try {
    console.log('Verificando retrasos automáticamente...');
    const retrasosEncontrados = await Apertura.verificarRetrasos();
    console.log(`Retrasos encontrados: ${retrasosEncontrados}`);
    res.json({ 
      message: 'Verificación de retrasos completada',
      retrasosEncontrados 
    });
  } catch (error) {
    console.error('Error verificando retrasos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener aperturas por estado
app.get('/api/apertura/estado/:estado', async (req, res) => {
  try {
    console.log('Buscando aperturas con estado:', req.params.estado);
    
    const aperturas = await Apertura.find({ estado: req.params.estado });
    
    console.log(`Aperturas encontradas: ${aperturas.length}`);
    res.json(aperturas);
  } catch (error) {
    console.error('Error buscando aperturas por estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de programación
app.get('/api/programacion', async (req, res) => {
  try {
    const programaciones = await Programacion.find();
    res.json(programaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/programacion', async (req, res) => {
  try {
    const programacion = new Programacion(req.body);
    await programacion.save();
    res.status(201).json(programacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar programación por ID
app.put('/api/programacion/:id', async (req, res) => {
  try {
    console.log('Actualizando programación:', req.params.id);
    console.log('Datos a actualizar:', req.body);
    
    const programacion = await Programacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!programacion) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }
    
    console.log('Programación actualizada:', programacion);
    res.json(programacion);
  } catch (error) {
    console.error('Error actualizando programación:', error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar programación por ID
app.delete('/api/programacion/:id', async (req, res) => {
  try {
    console.log('Eliminando programación:', req.params.id);
    
    const programacion = await Programacion.findByIdAndDelete(req.params.id);
    
    if (!programacion) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }
    
    console.log('Programación eliminada:', programacion);
    res.json({ message: 'Programación eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando programación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener programación por ID
app.get('/api/programacion/:id', async (req, res) => {
  try {
    console.log('Buscando programación:', req.params.id);
    
    const programacion = await Programacion.findById(req.params.id);
    
    if (!programacion) {
      return res.status(404).json({ error: 'Programación no encontrada' });
    }
    
    console.log('Programación encontrada:', programacion);
    res.json(programacion);
  } catch (error) {
    console.error('Error buscando programación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Conectar a la base de datos antes de exportar
connectDB().catch(error => {
  console.error('Error al conectar a la base de datos:', error);
});

export default app; 