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

// Endpoint temporal para verificar el modelo
router.get('/modelo-info', async (req, res) => {
    try {
        const schema = Apertura.schema;
        const tipoUnidadEnum = schema.path('tipoUnidad').enumValues;
        const estadoEnum = schema.path('estado').enumValues;
        
        res.json({
            tipoUnidad: {
                enum: tipoUnidadEnum,
                required: schema.path('tipoUnidad').isRequired
            },
            estado: {
                enum: estadoEnum,
                required: schema.path('estado').isRequired,
                default: schema.path('estado').defaultValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para actualizar el modelo dinámicamente
router.post('/actualizar-modelo', async (req, res) => {
    try {
        const schema = Apertura.schema;
        
        // Actualizar enum de tipoUnidad
        if (schema.path('tipoUnidad')) {
            schema.path('tipoUnidad').enumValues = [
                'URBANO', 'SUBURBANO', 'INTERMUNICIPAL', 'GRAN VIALE', 
                'BOXER', 'SPRINTER', 'VAGONETA', 'ORION'
            ];
        }
        
        // Actualizar enum de estado
        if (schema.path('estado')) {
            schema.path('estado').enumValues = [
                'pendiente', 'completado', 'cancelado', 'enviado', 
                'dashboard', 'retrasado', 'apertura', 'en_verificacion'
            ];
        }
        
        res.json({ 
            message: 'Modelo actualizado dinámicamente',
            tipoUnidad: schema.path('tipoUnidad').enumValues,
            estado: schema.path('estado').enumValues
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para actualizar todas las aperturas pendientes
router.post('/update-pendientes', async (req, res) => {
    try {
        const { estado, horaProgramada } = req.body;
        
        const result = await Apertura.updateMany(
            { estado: 'pendiente' },
            { 
                $set: { 
                    estado: estado || 'dashboard',
                    horaProgramada: horaProgramada || '05:30',
                    ultimaModificacion: {
                        usuario: 'sistema',
                        fecha: new Date()
                    }
                }
            }
        );
        
        res.json({ 
            message: `Se actualizaron ${result.modifiedCount} aperturas pendientes`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para mover aperturas del dashboard al verificador
router.post('/move-to-verificador', async (req, res) => {
    try {
        const { estado } = req.body;
        
        const result = await Apertura.updateMany(
            { estado: 'dashboard' },
            { 
                $set: { 
                    estado: estado || 'pendiente',
                    ultimaModificacion: {
                        usuario: 'sistema',
                        fecha: new Date()
                    }
                }
            }
        );
        
        res.json({ 
            message: `Se movieron ${result.modifiedCount} aperturas al Verificador`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para mover aperturas a estado estable en verificador
router.post('/move-to-verificacion-stable', async (req, res) => {
    try {
        const { estado } = req.body;
        
        // Mover todas las aperturas que estén en pendiente o dashboard a en_verificacion
        const result = await Apertura.updateMany(
            { estado: { $in: ['pendiente', 'dashboard'] } },
            { 
                $set: { 
                    estado: estado || 'en_verificacion',
                    ultimaModificacion: {
                        usuario: 'sistema',
                        fecha: new Date()
                    }
                }
            }
        );
        
        res.json({ 
            message: `Se movieron ${result.modifiedCount} aperturas a estado estable en Verificador`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para verificar retrasos
router.get('/verificar-retrasos', async (req, res) => {
    try {
        const resultado = await Apertura.verificarRetrasos();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para agregar nuevo estado al modelo
router.post('/agregar-estado', async (req, res) => {
    try {
        const { nuevoEstado } = req.body;
        const schema = Apertura.schema;
        
        if (schema.path('estado') && nuevoEstado) {
            // Agregar el nuevo estado al enum si no existe
            if (!schema.path('estado').enumValues.includes(nuevoEstado)) {
                schema.path('estado').enumValues.push(nuevoEstado);
            }
        }
        
        res.json({ 
            message: `Estado '${nuevoEstado}' agregado al modelo`,
            estadosActuales: schema.path('estado').enumValues
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para mover aperturas a completado temporalmente
router.post('/move-to-completado', async (req, res) => {
    try {
        const { estado } = req.body;
        
        // Mover todas las aperturas que estén en en_verificacion a completado
        const result = await Apertura.updateMany(
            { estado: 'en_verificacion' },
            { 
                $set: { 
                    estado: estado || 'completado',
                    ultimaModificacion: {
                        usuario: 'sistema',
                        fecha: new Date()
                    }
                }
            }
        );
        
        res.json({ 
            message: `Se movieron ${result.modifiedCount} aperturas a completado`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint para mover aperturas a pendiente (estado válido)
router.post('/move-to-pendiente', async (req, res) => {
    try {
        const { estado } = req.body;
        
        // Mover todas las aperturas que estén en en_verificacion a pendiente
        const result = await Apertura.updateMany(
            { estado: 'en_verificacion' },
            { 
                $set: { 
                    estado: estado || 'pendiente',
                    ultimaModificacion: {
                        usuario: 'sistema',
                        fecha: new Date()
                    }
                }
            }
        );
        
        res.json({ 
            message: `Se movieron ${result.modifiedCount} aperturas a pendiente`,
            modifiedCount: result.modifiedCount
        });
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

        if (!['pendiente', 'completado', 'cancelado', 'dashboard', 'en_verificacion'].includes(estado)) {
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

        // Crear rango de fechas para el día completo
        const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
        const fechaFin = new Date(fecha + 'T23:59:59.999Z');

        // Buscar aperturas de la fecha especificada
        const aperturas = await Apertura.find({ 
            fechaApertura: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        });

        if (aperturas.length === 0) {
            return res.json({ 
                message: 'No se encontraron aperturas para eliminar', 
                deletedCount: 0 
            });
        }

        // Eliminar todas las aperturas de esa fecha
        const result = await Apertura.deleteMany({ 
            fechaApertura: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        });
        
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