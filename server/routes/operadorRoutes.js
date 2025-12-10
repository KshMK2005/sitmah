import express from 'express';
import mongoose from 'mongoose';
import Operador from '../../src/database/models/Operador.js';

const router = express.Router();

// Buscar operador por tarjetón
router.get('/buscar/:tarjeton', async (req, res) => {
    try {
        const { tarjeton } = req.params;
        console.log('Buscando operador con tarjetón:', tarjeton);
        
        // Validar que el tarjetón no esté vacío
        if (!tarjeton || tarjeton.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Tarjetón inválido',
                message: 'El tarjetón no puede estar vacío'
            });
        }
        
        const operador = await Operador.buscarPorTarjeton(tarjeton);
        console.log('Resultado de búsqueda:', operador ? 'Encontrado' : 'No encontrado');
        
        if (!operador) {
            return res.status(404).json({ 
                error: 'Operador no encontrado',
                message: `No se encontró operador con tarjetón: ${tarjeton}`,
                tarjetonBuscado: tarjeton
            });
        }
        
        console.log('Operador encontrado:', {
            id: operador.id,
            tarjeton: operador.tarjeton,
            nombre: operador.nombre
        });
        
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
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// Obtener operadores de la colección operadors (específico para el frontend)
router.get('/operadors', async (req, res) => {
    try {
        console.log('Obteniendo operadores de la colección operadors...');
        
        // Usar directamente la colección operadors
        const db = req.app.locals.db || mongoose.connection.db;
        const operadorsCollection = db.collection('operadors');
        
        const operadors = await operadorsCollection.find({}).toArray();
        console.log(`Encontrados ${operadors.length} operadores en operadors`);
        
        res.json({
            success: true,
            total: operadors.length,
            operadores: operadors
        });
    } catch (error) {
        console.error('Error al obtener operadores de operadors:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
});

// Ruta para verificar el estado de la base de datos
router.get('/status', async (req, res) => {
    try {
        const totalOperadores = await Operador.countDocuments();
        const sampleOperadores = await Operador.find().limit(3).select('tarjeton nombre');
        
        res.json({
            success: true,
            status: 'Conectado',
            totalOperadores,
            sampleOperadores,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al verificar estado:', error);
        res.status(500).json({ 
            error: 'Error de conexión',
            message: error.message 
        });
    }
});

export default router; 