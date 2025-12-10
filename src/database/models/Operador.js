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
    try {
        // Normalizar el tarjetón: quitar espacios, poner en mayúsculas
        const tarjetonNormalizado = tarjeton.trim().toUpperCase().replace(/\s+/g, '');
        
        // Buscar con coincidencia exacta primero
        let operador = await this.findOne({ tarjeton: tarjetonNormalizado });
        
        // Si no se encuentra, buscar con regex para casos donde hay variaciones
        if (!operador) {
            operador = await this.findOne({
                tarjeton: { $regex: `^${tarjetonNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
            });
        }
        
        return operador;
    } catch (error) {
        console.error('Error en buscarPorTarjeton:', error);
        throw error;
    }
};

// Método estático para buscar operador por nombre (búsqueda parcial)
operadorSchema.statics.buscarPorNombre = async function(nombre) {
    return await this.find({
        nombre: { $regex: nombre, $options: 'i' }
    }).limit(10);
};

export default mongoose.model('Operador', operadorSchema); 