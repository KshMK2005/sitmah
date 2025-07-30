const mongoose = require('mongoose');
const Apertura = require('./models/Apertura');
const Programacion = require('./models/Programacion');
require('dotenv').config();

const tiposUnidad = ['URBANO', 'SUBURBANO', 'INTERMUNICIPAL'];
const nombres = ['Juan Pérez', 'Ana López', 'Carlos Ruiz', 'María Torres', 'Luis Gómez', 'Sofía Díaz', 'Pedro Sánchez', 'Laura Ramírez', 'Miguel Castro', 'Lucía Morales'];

function generarEconomico(i) {
    return `ECO${(i + 100).toString().padStart(3, '0')}`;
}
function generarTarjeton(i) {
    return `TARJ${(i + 1000).toString().padStart(4, '0')}`;
}

const generarApertura = (i, programacion) => {
    const tipoUnidad = tiposUnidad[Math.floor(Math.random() * tiposUnidad.length)];
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const estado = ['pendiente', 'completado', 'cancelado'][Math.floor(Math.random() * 3)];
    return {
        programacionId: programacion._id,
        ruta: programacion.ruta,
        intervalo: programacion.intervalo,
        corridaInicial: programacion.corridaInicial,
        corridaFinal: programacion.corridaFinal,
        horaSalida: programacion.horaSalida,
        tipoUnidad,
        economico: generarEconomico(i),
        tarjeton: generarTarjeton(i),
        nombre,
        fechaApertura: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
        estado,
        observaciones: '',
        usuarioCreacion: 'sistema',
        ultimaModificacion: {
            usuario: 'sistema',
            fecha: new Date()
        }
    };
};

const seedApertura = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Obtener los primeros 5 programaciones
        const programaciones = await Programacion.find().limit(5);
        if (programaciones.length === 0) {
            throw new Error('No hay programaciones en la base de datos. Inserta programaciones primero.');
        }

        // Limpiar la colección de aperturas
        await Apertura.deleteMany({});
        console.log('Colección de aperturas limpiada');

        // Generar 50 aperturas repartidas entre las programaciones
        const aperturas = Array.from({ length: 50 }, (_, i) => {
            const prog = programaciones[i % programaciones.length];
            return generarApertura(i, prog);
        });

        await Apertura.insertMany(aperturas);
        console.log('50 aperturas insertadas exitosamente');

        await mongoose.connection.close();
        console.log('Conexión cerrada');
    } catch (error) {
        console.error('Error al sembrar aperturas:', error);
        process.exit(1);
    }
};

seedApertura(); 