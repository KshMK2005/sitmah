import mongoose from 'mongoose';

const aperturaSchema = new mongoose.Schema({
    programacionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programacion',
        required: [true, 'El ID de la programación es obligatorio']
    },
    // Campos de programación
    ruta: {
        type: String,
        required: [true, 'La ruta es obligatoria'],
        trim: true
    },
    intervalo: {
        type: Number,
        required: [true, 'El intervalo es obligatorio'],
        min: [1, 'El intervalo debe ser mayor a 0']
    },
    corridaInicial: {
        type: Number,
        required: [true, 'La corrida inicial es obligatoria'],
        min: [1, 'La corrida inicial debe ser mayor a 0']
    },
    corridaFinal: {
        type: Number,
        required: [true, 'La corrida final es obligatoria'],
        min: [1, 'La corrida final debe ser mayor a 0'],
        validate: {
            validator: function(v) {
                return v >= this.corridaInicial;
            },
            message: 'La corrida final debe ser mayor o igual a la corrida inicial'
        }
    },
    horaSalida: {
        type: String
        // SIN VALIDACIONES - que pase cualquier cosa
    },
    // Campos existentes
    tipoUnidad: {
        type: String,
        required: [true, 'El tipo de unidad es obligatorio'],
        enum: ['URBANO', 'SUBURBANO', 'INTERMUNICIPAL', 'GRAN VIALE', 'BOXER', 'SPRINTER', 'VAGONETA', 'ORION']
    },
    economico: {
        type: String,
        required: [true, 'El número económico es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[A-Z0-9]{1,10}$/.test(v);
            },
            message: 'El número económico debe contener solo letras mayúsculas y números (máximo 10 caracteres)'
        }
    },
    tarjeton: {
        type: String,
        required: [true, 'El número de tarjetón es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[A-Z0-9]{1,15}$/.test(v);
            },
            message: 'El número de tarjetón debe contener solo letras mayúsculas y números (máximo 15 caracteres)'
        }
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del operador es obligatorio'],
        trim: true,
        validate: {
            validator: function(v) {
                return v.length >= 3 && v.length <= 100;
            },
            message: 'El nombre debe tener entre 3 y 100 caracteres'
        }
    },
    fechaApertura: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['pendiente', 'apertura', 'en_verificacion', 'completado', 'cancelado', 'enviado', 'dashboard'],
        default: 'pendiente'
    },
    observaciones: {
        type: String,
        trim: true,
        maxlength: [500, 'Las observaciones no pueden exceder los 500 caracteres']
    },
    comentario: {
        type: String,
        trim: true,
        maxlength: [500, 'El comentario no puede exceder los 500 caracteres']
    },
    usuarioCreacion: {
        type: String,
        required: [true, 'El usuario que crea la apertura es obligatorio'],
        trim: true
    },
    ultimaModificacion: {
        usuario: {
            type: String,
            trim: true
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Índices para búsquedas frecuentes
aperturaSchema.index({ economico: 1 });
aperturaSchema.index({ tarjeton: 1 });
aperturaSchema.index({ fechaApertura: -1 });
aperturaSchema.index({ estado: 1 });

// Método estático para obtener estadísticas
aperturaSchema.statics.getEstadisticas = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$tipoUnidad',
                total: { $sum: 1 },
                pendientes: {
                    $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] }
                },
                completados: {
                    $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] }
                },
                cancelados: {
                    $sum: { $cond: [{ $eq: ['$estado', 'cancelado'] }, 1, 0] }
                }
            }
        }
    ]);
};

// Método para verificar si una unidad está disponible
aperturaSchema.statics.verificarDisponibilidad = async function(economico, tarjeton, ignoreId = null) {
    const query = {
        $or: [
            { economico: economico },
            { tarjeton: tarjeton }
        ],
        estado: { $in: ['apertura', 'pendiente', 'en_verificacion'] }
    };
    if (ignoreId) {
        query._id = { $ne: ignoreId };
    }
    const aperturaActiva = await this.findOne(query);
    if (!aperturaActiva) return { disponible: true };
    // Determinar el campo en conflicto
    let campo = null;
    let valor = null;
    if (aperturaActiva.economico === economico) {
        campo = 'número económico';
        valor = economico;
    } else if (aperturaActiva.tarjeton === tarjeton) {
        campo = 'tarjetón';
        valor = tarjeton;
    }
    return {
        disponible: false,
        campo,
        valor,
        id: aperturaActiva._id
    };
};

// Middleware pre-save para actualizar última modificación
aperturaSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.ultimaModificacion = {
            usuario: this.usuarioCreacion,
            fecha: new Date()
        };
    }
    next();
});

export default mongoose.model('Apertura', aperturaSchema);