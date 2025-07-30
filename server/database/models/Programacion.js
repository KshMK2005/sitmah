import mongoose from 'mongoose';

const programacionSchema = new mongoose.Schema({
    ruta: {
        type: String,
        required: [true, 'La ruta es obligatoria'],
        trim: true
    },
    tipoVehiculo: {
        type: String,
        required: [true, 'El tipo de vehículo es obligatorio'],
        enum: ['GRAN VIALE', 'BOXER', 'SPRINTER', 'VAGONETA'],
        trim: true
    },
    cantidadUnidades: {
        type: Number,
        required: [true, 'La cantidad de unidades es obligatoria'],
        min: [1, 'La cantidad mínima de unidades es 1']
    },
    numeroEconomico: {
        type: String,
        required: [true, 'El número económico es obligatorio'],
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
        type: String,
        required: [true, 'La hora de salida es obligatoria'],
        validate: {
            validator: function(v) {
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'La hora de salida debe estar en formato HH:mm'
        }
    },
    horarios: [{
        hora: {
            type: String,
            required: [true, 'La hora es obligatoria'],
            validate: {
                validator: function(v) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'La hora debe estar en formato HH:mm'
            }
        },
        corrida: {
            type: Number,
            required: [true, 'La corrida es obligatoria'],
            min: [1, 'La corrida debe ser mayor a 0']
        },
        estado: {
            type: String,
            enum: ['pendiente', 'asignado', 'completado'],
            default: 'pendiente'
        }
    }],
    programador: {
        type: String,
        required: [true, 'El programador es obligatorio'],
        trim: true
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

programacionSchema.statics.getEstadisticas = async function(){
    const estadisticas = await this.aggregate([
        {
            $group: {
                _id: '$tipoVehiculo',
                totalUnidades: { $sum: '$cantidadUnidades' },
                totalKilometraje: { $sum: { $toDouble: '$kilometrajeProgramado' } },
                totalViajes: { $sum: '$viajesProgramados' }
            }
        }
    ]);
    return estadisticas;
};

export default mongoose.model('Programacion', programacionSchema); 