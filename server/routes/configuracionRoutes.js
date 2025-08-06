import express from 'express';
import Configuracion from '../database/models/Configuracion.js';

const router = express.Router();

// Obtener configuración por nombre
router.get('/:nombre', async (req, res) => {
  try {
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
    const configs = await Configuracion.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuraciones', message: err.message });
  }
});

// Crear o actualizar configuración
router.post('/', async (req, res) => {
  try {
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

// Actualizar configuración específica
router.put('/:nombre', async (req, res) => {
  try {
    const { valor, descripcion } = req.body;
    if (!valor) {
      return res.status(400).json({ error: 'Valor es requerido' });
    }

    const config = await Configuracion.findOneAndUpdate(
      { nombre: req.params.nombre },
      { 
        $set: { 
          valor, 
          descripcion: descripcion || '',
          fechaActualizacion: new Date()
        }
      },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar configuración', message: err.message });
  }
});

export default router; 