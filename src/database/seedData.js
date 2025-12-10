const mongoose = require('mongoose');
const Programacion = require('./models/Programacion');
require('dotenv').config();

const rutas = [
    'Ruta 1 - Centro',
    'Ruta 2 - Norte',
    'Ruta 3 - Sur',
    'Ruta 4 - Este',
    'Ruta 5 - Oeste'
];

const tiposVehiculo = ['GRAN VIALE', 'BOXER', 'SPRINTER', 'VAGONETA'];

const formatearHora = (fecha) => {
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
};

const generarHorarios = (horaSalida, intervalo, corridaInicial, corridaFinal) => {
    const horarios = [];
    const [horas, minutos] = horaSalida.split(':').map(Number);
    let horaActual = new Date();
    horaActual.setHours(horas, minutos, 0, 0);
    const intervaloNum = parseInt(intervalo);

    for (let corrida = corridaInicial; corrida <= corridaFinal; corrida++) {
        horarios.push({
            hora: formatearHora(horaActual),
            corrida: corrida,
            estado: 'pendiente'
        });
        horaActual.setMinutes(horaActual.getMinutes() + intervaloNum);
    }
    return horarios;
};

const generarProgramacion = (index) => {
    const ruta = rutas[Math.floor(Math.random() * rutas.length)];
    const tipoVehiculo = tiposVehiculo[Math.floor(Math.random() * tiposVehiculo.length)];
    const cantidadUnidades = Math.floor(Math.random() * 5) + 1;
    const intervalo = [15, 20, 30, 45][Math.floor(Math.random() * 4)];
    const corridaInicial = Math.floor(Math.random() * 10) + 1;
    const corridaFinal = corridaInicial + Math.floor(Math.random() * 10) + 5;
    
    // Generar hora de salida en formato HH:mm
    const hora = Math.floor(Math.random() * 12) + 6;
    const minutos = Math.floor(Math.random() * 2) * 30;
    const horaSalida = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

    return {
        ruta,
        tipoVehiculo,
        cantidadUnidades,
        intervalo,
        corridaInicial,
        corridaFinal,
        horaSalida,
        horarios: generarHorarios(horaSalida, intervalo, corridaInicial, corridaFinal),
        programador: 'sistema',
        estado: 'activo',
        fechaCreacion: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    };
};

const seedDatabase = async () => {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Limpiar la colección existente
        await Programacion.deleteMany({});
        console.log('Colección limpiada');

        // Generar 50 programaciones
        const programaciones = Array.from({ length: 50 }, (_, i) => generarProgramacion(i));

        // Insertar las programaciones
        await Programacion.insertMany(programaciones);
        console.log('50 programaciones insertadas exitosamente');

        // Cerrar la conexión
        await mongoose.connection.close();
        console.log('Conexión cerrada');

    } catch (error) {
        console.error('Error al sembrar la base de datos:', error);
        process.exit(1);
    }
};

// Ejecutar el script
seedDatabase(); 