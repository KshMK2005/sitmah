import mongoose from 'mongoose';
import Operador from './models/Operador.js';
import dotenv from 'dotenv';

dotenv.config();

const operadores = [
    {
        id: 1,
        tarjeton: 'TPA0001',
        nombre: 'Juan Carlos Pérez López'
    },
    {
        id: 2,
        tarjeton: 'TPA0002',
        nombre: 'María Elena Rodríguez García'
    },
    {
        id: 3,
        tarjeton: 'TPA0003',
        nombre: 'Roberto Antonio Silva Mendoza'
    },
    {
        id: 4,
        tarjeton: 'TPA0004',
        nombre: 'Ana Patricia Morales Torres'
    },
    {
        id: 5,
        tarjeton: 'TPA0005',
        nombre: 'Carlos Alberto Herrera Jiménez'
    },
    {
        id: 6,
        tarjeton: 'TPA0006',
        nombre: 'Luz María Fernández Castro'
    },
    {
        id: 7,
        tarjeton: 'TPA0007',
        nombre: 'Miguel Ángel Vargas Ruiz'
    },
    {
        id: 8,
        tarjeton: 'TPA0008',
        nombre: 'Carmen Elena Soto Paredes'
    },
    {
        id: 9,
        tarjeton: 'TPA0009',
        nombre: 'Francisco Javier Mendoza López'
    },
    {
        id: 10,
        tarjeton: 'TPA0010',
        nombre: 'Isabel Cristina Torres Vega'
    }
];

const seedOperadores = async () => {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Limpiar la colección existente
        await Operador.deleteMany({});
        console.log('Colección de operadores limpiada');

        // Insertar los operadores
        await Operador.insertMany(operadores);
        console.log(`${operadores.length} operadores insertados exitosamente`);

        // Mostrar los operadores insertados
        const operadoresInsertados = await Operador.find().sort({ id: 1 });
        console.log('Operadores en la base de datos:');
        operadoresInsertados.forEach(op => {
            console.log(`ID: ${op.id}, Tarjetón: ${op.tarjeton}, Nombre: ${op.nombre}`);
        });

        // Verificar que la colección se llama correctamente
        const collections = await mongoose.connection.db.listCollections().toArray();
        const operadorCollection = collections.find(col => col.name === 'operadors');
        console.log('Colección encontrada:', operadorCollection ? operadorCollection.name : 'No encontrada');

        // Cerrar la conexión
        await mongoose.connection.close();
        console.log('Conexión cerrada');

    } catch (error) {
        console.error('Error al sembrar operadores:', error);
        process.exit(1);
    }
};

// Ejecutar el script
seedOperadores(); 