import express from 'express';
import Programacion from '../../src/database/models/Programacion.js';

const router = express.Router();

// Obtener todas las programaciones
router.get('/', async (req, res) => {
    try {
        const programaciones = await Programacion.find()
            .sort({ fechaCreacion: -1 });
        res.json(programaciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener una programación específica
router.get('/:id', async (req, res) => {
    try {
        const programacion = await Programacion.findById(req.params.id);
        if (programacion) {
            res.json(programacion);
        } else {
            res.status(404).json({ message: 'Programación no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva programación
router.post('/', async (req, res) => {
    try {
        const programacion = new Programacion(req.body);
        const nuevaProgramacion = await programacion.save();
        res.status(201).json(nuevaProgramacion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar una programación
router.put('/:id', async (req, res) => {
    try {
        const programacion = await Programacion.findById(req.params.id);
        if (!programacion) {
            return res.status(404).json({ message: 'Programación no encontrada' });
        }

        Object.assign(programacion, req.body);
        const programacionActualizada = await programacion.save();
        res.json(programacionActualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar una programación
router.delete('/:id', async (req, res) => {
    try {
        const programacion = await Programacion.findById(req.params.id);
        if (!programacion) {
            return res.status(404).json({ message: 'Programación no encontrada' });
        }

        await programacion.deleteOne();
        res.json({ message: 'Programación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener estadísticas de programación
router.get('/estadisticas/totales', async (req, res) => {
    try {
        const estadisticas = await Programacion.aggregate([
            {
                $group: {
                    _id: '$tipoVehiculo',
                    totalUnidades: { $sum: '$cantidadUnidades' },
                    totalHorarios: { $sum: { $size: '$horarios' } }
                }
            }
        ]);
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 