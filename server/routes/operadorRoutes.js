import express from 'express';
import Operador from '../../src/database/models/Operador.js';

const router = express.Router();

// Buscar operador por tarjetón
router.get('/buscar/:tarjeton', async (req, res) => {
    try {
        const { tarjeton } = req.params;
        const operador = await Operador.buscarPorTarjeton(tarjeton);
        
        if (!operador) {
            return res.status(404).json({ 
                error: 'Operador no encontrado',
                message: `No se encontró operador con tarjetón: ${tarjeton}`
            });
        }
        
        res.json({
            success: true,
            operador: {
                id: operador.id,
                tarjeton: operador.tarjeton,
                nombre: operador.nombre
            }
        });
    } catch (error) {
        console.error('Error al buscar operador:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

// Buscar operadores por nombre (búsqueda parcial)
router.get('/buscar-nombre/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;
        const operadores = await Operador.buscarPorNombre(nombre);
        
        res.json({
            success: true,
            operadores: operadores.map(op => ({
                id: op.id,
                tarjeton: op.tarjeton,
                nombre: op.nombre
            }))
        });
    } catch (error) {
        console.error('Error al buscar operadores por nombre:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

// Obtener todos los operadores (para debugging)
router.get('/', async (req, res) => {
    try {
        const operadores = await Operador.find().sort({ id: 1 });
        res.json({
            success: true,
            total: operadores.length,
            operadores: operadores
        });
    } catch (error) {
        console.error('Error al obtener operadores:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

export default router; 