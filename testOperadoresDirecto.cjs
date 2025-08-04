const mongoose = require('mongoose');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/sitmah';

async function testOperadores() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar la colección operadors
        const db = mongoose.connection.db;
        const operadorsCollection = db.collection('operadors');
        
        console.log('\n📊 Verificando colección operadors...');
        const totalOperadors = await operadorsCollection.countDocuments();
        console.log(`Total de operadores en operadors: ${totalOperadors}`);

        if (totalOperadors > 0) {
            const sampleOperadors = await operadorsCollection.find().limit(5).toArray();
            console.log('\n📋 Muestra de operadores:');
            sampleOperadors.forEach((op, index) => {
                console.log(`${index + 1}. Tarjetón: ${op.tarjeton}, Nombre: ${op.nombre}`);
            });
        }

        // Verificar la colección operadores
        console.log('\n📊 Verificando colección operadores...');
        const operadoresCollection = db.collection('operadores');
        const totalOperadores = await operadoresCollection.countDocuments();
        console.log(`Total de operadores en operadores: ${totalOperadores}`);

        if (totalOperadores > 0) {
            const sampleOperadores = await operadoresCollection.find().limit(5).toArray();
            console.log('\n📋 Muestra de operadores:');
            sampleOperadores.forEach((op, index) => {
                console.log(`${index + 1}. Tarjetón: ${op.tarjeton}, Nombre: ${op.nombre}`);
            });
        }

        // Verificar la colección programacions
        console.log('\n📊 Verificando colección programacions...');
        const programacionsCollection = db.collection('programacions');
        const totalProgramacions = await programacionsCollection.countDocuments();
        console.log(`Total de programaciones: ${totalProgramacions}`);

        if (totalProgramacions > 0) {
            const sampleProgramacions = await programacionsCollection.find().limit(5).toArray();
            console.log('\n📋 Muestra de programaciones:');
            sampleProgramacions.forEach((prog, index) => {
                console.log(`${index + 1}. Ruta: ${prog.ruta}, Hora: ${prog.horaSalida}`);
            });
        }

        console.log('\n✅ Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

testOperadores(); 