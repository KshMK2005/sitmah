const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Definida' : 'No definida');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

// Importar modelos
const Usuario = require('../src/database/models/Usuario');
const Apertura = require('../src/database/models/Apertura');
const Programacion = require('../src/database/models/Programacion');
const Operador = require('../src/database/models/Operador');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API de SITMAH funcionando en Vercel' });
});

// Rutas de usuarios
app.get('/usuarios/admin', async (req, res) => {
  try {
    const admin = await Usuario.findOne({ rol: 'administrador' });
    res.json(admin || { message: 'No hay administrador' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar usuario por nombre de usuario
app.get('/usuarios/:usuario', async (req, res) => {
  try {
    console.log('Buscando usuario:', req.params.usuario);
    const usuario = await Usuario.findOne({ usuario: req.params.usuario });
    console.log('Usuario encontrado:', usuario);
    
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error buscando usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de operadores
app.get('/operadores', async (req, res) => {
  try {
    const operadores = await Operador.find();
    res.json(operadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/operadores/buscar/:tarjeton', async (req, res) => {
  try {
    const operador = await Operador.findOne({ tarjeton: req.params.tarjeton });
    res.json(operador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de aperturas
app.get('/apertura', async (req, res) => {
  try {
    const aperturas = await Apertura.find();
    res.json(aperturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/apertura', async (req, res) => {
  try {
    const apertura = new Apertura(req.body);
    await apertura.save();
    res.status(201).json(apertura);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rutas de programación
app.get('/programacion', async (req, res) => {
  try {
    const programaciones = await Programacion.find();
    res.json(programaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/programacion', async (req, res) => {
  try {
    const programacion = new Programacion(req.body);
    await programacion.save();
    res.status(201).json(programacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
connectDB();

module.exports = app; 