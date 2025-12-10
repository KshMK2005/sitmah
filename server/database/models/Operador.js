import mongoose from 'mongoose';

const operadorSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    tarjeton: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'operadors' // Especificar el nombre exacto de la colección
});

// Índices para búsquedas eficientes
operadorSchema.index({ tarjeton: 1 });
operadorSchema.index({ nombre: 1 });

// Método estático para buscar operador por tarjetón
operadorSchema.statics.buscarPorTarjeton = async function(tarjeton) {
    return await this.findOne({ tarjeton: tarjeton });
};

// Método estático para buscar operador por nombre (búsqueda parcial)
operadorSchema.statics.buscarPorNombre = async function(nombre) {
    return await this.find({
        nombre: { $regex: nombre, $options: 'i' }
    }).limit(10);
};

export default mongoose.model('Operador', operadorSchema); 