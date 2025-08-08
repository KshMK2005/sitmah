import express from 'express';
import Apertura from '../../src/database/models/Apertura.js';

const router = express.Router();

// Middleware para validar datos de apertura
const validarApertura = async (req, res, next) => {
    try {
        const { economico, tarjeton } = req.body;
        let ignoreId = null;
        // Si es edición (PUT), ignorar el propio registro
        if (req.method === 'PUT' && req.params.id) {
            ignoreId = req.params.id;
        }
        // Verificar disponibilidad
        const disponible = await Apertura.verificarDisponibilidad(economico, tarjeton, ignoreId);
        if (!disponible.disponible) {
            return res.status(400).json({ 
                message: `El ${disponible.campo} '${disponible.valor}' ya está en uso en una apertura activa (ID: ${disponible.id})` 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las aperturas con filtros
router.get('/', async (req, res) => {
    try {
        const { 
            estado, 
            tipoUnidad, 
            fechaInicio, 
            fechaFin,
            economico,
            tarjeton,
            nombre
        } = req.query;

        // Construir filtro
        const filtro = {};
        
        if (estado) filtro.estado = estado;
        if (tipoUnidad) filtro.tipoUnidad = tipoUnidad;
        if (economico) filtro.economico = new RegExp(economico, 'i');
        if (tarjeton) filtro.tarjeton = new RegExp(tarjeton, 'i');
        if (nombre) filtro.nombre = new RegExp(nombre, 'i');
        
        if (fechaInicio || fechaFin) {
            filtro.fechaApertura = {};
            if (fechaInicio) filtro.fechaApertura.$gte = new Date(fechaInicio);
            if (fechaFin) filtro.fechaApertura.$lte = new Date(fechaFin);
        }

        const aperturas = await Apertura.find(filtro)
            .populate('programacionId')
            .sort({ fechaApertura: -1 });
            
        res.json(aperturas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener estadísticas de aperturas
router.get('/estadisticas', async (req, res) => {
    try {
        const estadisticas = await Apertura.getEstadisticas();
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva apertura
router.post('/', validarApertura, async (req, res) => {
    try {
        console.log('Datos recibidos en el servidor:', req.body);
        
        const apertura = new Apertura({
            ...req.body,
            usuarioCreacion: req.body.usuarioCreacion || 'sistema'
        });
        
        console.log('Objeto Apertura creado:', apertura);
        
        const nuevaApertura = await apertura.save();
        console.log('Apertura guardada en la base de datos:', nuevaApertura);
        
        res.status(201).json(nuevaApertura);
    } catch (error) {
        console.error('Error al crear apertura:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                message: 'Ya existe una apertura con ese número económico o tarjetón' 
            });
        } else if (error.errors) {
            // Extrae el primer mensaje de error de validación de Mongoose
            const mensajes = Object.values(error.errors).map(e => e.message);
            res.status(400).json({ message: mensajes.join(' | ') });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Obtener una apertura específica
router.get('/:id', async (req, res) => {
    try {
        const apertura = await Apertura.findById(req.params.id)
            .populate('programacionId');
            
        if (apertura) {
            res.json(apertura);
        } else {
            res.status(404).json({ message: 'Apertura no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar una apertura
router.put('/:id', validarApertura, async (req, res) => {
    try {
        const apertura = await Apertura.findById(req.params.id);
        
        if (!apertura) {
            return res.status(404).json({ message: 'Apertura no encontrada' });
        }

        // No permitir cambiar el estado a 'completado' si ya está 'cancelado'
        if (apertura.estado === 'cancelado' && req.body.estado === 'completado') {
            return res.status(400).json({ 
                message: 'No se puede cambiar el estado de una apertura cancelada a completada' 
            });
        }

        // Actualizar campos
        Object.assign(apertura, req.body);
        apertura.ultimaModificacion = {
            usuario: req.body.usuarioModificacion || 'sistema',
            fecha: new Date()
        };

        const aperturaActualizada = await apertura.save();
        res.json(aperturaActualizada);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ 
                message: 'Ya existe una apertura con ese número económico o tarjetón' 
            });
        } else if (error.errors) {
            // Extrae el primer mensaje de error de validación de Mongoose
            const mensajes = Object.values(error.errors).map(e => e.message);
            res.status(400).json({ message: mensajes.join(' | ') });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Cambiar estado de una apertura
router.patch('/:id/estado', async (req, res) => {
    try {
        const { estado, usuario } = req.body;
        const apertura = await Apertura.findById(req.params.id);
        
        if (!apertura) {
            return res.status(404).json({ message: 'Apertura no encontrada' });
        }

        if (!['pendiente', 'completado', 'cancelado', 'dashboard'].includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        if (apertura.estado === 'cancelado' && estado === 'completado') {
            return res.status(400).json({ 
                message: 'No se puede cambiar el estado de una apertura cancelada a completada' 
            });
        }

        apertura.estado = estado;
        apertura.ultimaModificacion = {
            usuario: usuario || 'sistema',
            fecha: new Date()
        };

        const aperturaActualizada = await apertura.save();
        res.json(aperturaActualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar aperturas por fecha (para limpiar datos de prueba)
router.delete('/deleteByDate', async (req, res) => {
    try {
        const { fecha } = req.body;
        
        if (!fecha) {
            return res.status(400).json({ message: 'Fecha requerida' });
        }

        // Buscar aperturas de la fecha especificada
        const aperturas = await Apertura.find({ 
            fechaApertura: fecha 
        });

        if (aperturas.length === 0) {
            return res.json({ 
                message: 'No se encontraron aperturas para eliminar', 
                deletedCount: 0 
            });
        }

        // Eliminar todas las aperturas de esa fecha
        const result = await Apertura.deleteMany({ fechaApertura: fecha });
        
        res.json({ 
            message: `Se eliminaron ${result.deletedCount} aperturas del ${fecha}`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar una apertura (solo si está pendiente)
router.delete('/:id', async (req, res) => {
    try {
        const apertura = await Apertura.findById(req.params.id);
        
        if (!apertura) {
            return res.status(404).json({ message: 'Apertura no encontrada' });
        }

        if (apertura.estado !== 'pendiente') {
            return res.status(400).json({ 
                message: 'Solo se pueden eliminar aperturas en estado pendiente' 
            });
        }

        await Apertura.deleteOne({ _id: req.params.id });
        res.json({ message: 'Apertura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;