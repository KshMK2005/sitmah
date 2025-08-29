import express from 'express';
import Usuario from '../database/models/Usuario.js';

const router = express.Router();

// Registrar usuario
router.post('/', async (req, res) => {
  try {
    const { usuario, password, rol, tarjeton, correo } = req.body;
    if (!usuario || !password || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const nuevoUsuario = new Usuario({ usuario, password, rol, tarjeton, correo });
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }
    res.status(500).json({ error: 'Error al registrar usuario', message: err.message });
  }
});

// Buscar usuario por nombre
router.get('/:usuario', async (req, res) => {
  try {
    console.log('🔍 Buscando usuario en BD:', req.params.usuario);
    
    const usuario = await Usuario.findOne({ usuario: req.params.usuario });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado en BD:', req.params.usuario);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    console.log('✅ Usuario encontrado en BD:', usuario.usuario);
    res.json(usuario);
  } catch (err) {
    console.error('❌ Error al buscar usuario en BD:', err);
    res.status(500).json({ error: 'Error al buscar usuario', message: err.message });
  }
});

// Actualizar usuario
router.put('/:usuario', async (req, res) => {
  try {
    const { password, rol, tarjeton, correo } = req.body;
    const usuarioActualizado = await Usuario.findOneAndUpdate(
      { usuario: req.params.usuario },
      { $set: { password, rol, tarjeton, correo } },
      { new: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario', message: err.message });
  }
});


// Buscar usuario por tarjetón
router.get('/tarjeton/:tarjeton', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ tarjeton: req.params.tarjeton });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuario por tarjetón', message: err.message });
  }
});

// Actualizar tema del usuario
router.put('/:usuario/tema', async (req, res) => {
  try {
    const { tema } = req.body;
    if (!tema) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }
    
    const usuarioActualizado = await Usuario.findOneAndUpdate(
      { usuario: req.params.usuario },
      { $set: { tema } },
      { new: true }
    );
    
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tema del usuario', message: err.message });
  }
});

export default router;
