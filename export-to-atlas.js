const mongoose = require('mongoose');
const fs = require('fs');

// Importar modelos
const Usuario = require('./server/database/models/Usuario');
const Apertura = require('./src/database/models/Apertura');
const Programacion = require('./src/database/models/Programacion');
const Operador = require('./src/database/models/Operador');

// Configuración de conexiones
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/sitmah';
const ATLAS_MONGODB_URI = process.env.ATLAS_MONGODB_URI || 'mongodb+srv://sitmah_user:tu_contraseña@cluster.mongodb.net/sitmah?retryWrites=true&w=majority';

console.log('🚀 Iniciando exportación a MongoDB Atlas...');
console.log('📊 Base de datos local:', LOCAL_MONGODB_URI);
console.log('☁️  Base de datos Atlas:', ATLAS_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

async function exportToAtlas() {
    let localConnection, atlasConnection;
    
    try {
        // Conectar a base de datos local
        console.log('\n📡 Conectando a base de datos local...');
        localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado a base de datos local');

        // Conectar a MongoDB Atlas
        console.log('\n☁️  Conectando a MongoDB Atlas...');
        atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado a MongoDB Atlas');

        // Exportar Usuarios
        console.log('\n👥 Exportando usuarios...');
        const usuarios = await Usuario.find({});
        if (usuarios.length > 0) {
            await atlasConnection.model('Usuario', Usuario.schema).insertMany(usuarios);
            console.log(`✅ ${usuarios.length} usuarios exportados`);
        } else {
            console.log('ℹ️  No hay usuarios para exportar');
        }

        // Exportar Operadores
        console.log('\n🚗 Exportando operadores...');
        const operadores = await Operador.find({});
        if (operadores.length > 0) {
            await atlasConnection.model('Operador', Operador.schema).insertMany(operadores);
            console.log(`✅ ${operadores.length} operadores exportados`);
        } else {
            console.log('ℹ️  No hay operadores para exportar');
        }

        // Exportar Programaciones
        console.log('\n📅 Exportando programaciones...');
        const programaciones = await Programacion.find({});
        if (programaciones.length > 0) {
            await atlasConnection.model('Programacion', Programacion.schema).insertMany(programaciones);
            console.log(`✅ ${programaciones.length} programaciones exportadas`);
        } else {
            console.log('ℹ️  No hay programaciones para exportar');
        }

        // Exportar Aperturas
        console.log('\n🚪 Exportando aperturas...');
        const aperturas = await Apertura.find({});
        if (aperturas.length > 0) {
            await atlasConnection.model('Apertura', Apertura.schema).insertMany(aperturas);
            console.log(`✅ ${aperturas.length} aperturas exportadas`);
        } else {
            console.log('ℹ️  No hay aperturas para exportar');
        }

        // Generar reporte
        console.log('\n📋 Generando reporte...');
        const reporte = {
            fecha: new Date().toISOString(),
            usuarios: usuarios.length,
            operadores: operadores.length,
            programaciones: programaciones.length,
            aperturas: aperturas.length,
            total: usuarios.length + operadores.length + programaciones.length + aperturas.length
        };

        fs.writeFileSync('export-report.json', JSON.stringify(reporte, null, 2));
        console.log('✅ Reporte guardado en export-report.json');

        console.log('\n🎉 ¡Exportación completada exitosamente!');
        console.log(`📊 Total de documentos exportados: ${reporte.total}`);

    } catch (error) {
        console.error('❌ Error durante la exportación:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Solución: Verifica que la cadena de conexión de Atlas sea correcta');
            console.log('   Asegúrate de reemplazar "tu_contraseña" con tu contraseña real');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solución: Verifica que MongoDB local esté corriendo');
            console.log('   Ejecuta: mongod');
        }
        
        if (error.code === 11000) {
            console.log('\n💡 Algunos documentos ya existen en Atlas (duplicados)');
            console.log('   Esto es normal si ya habías exportado antes');
        }
        
    } finally {
        // Cerrar conexiones
        if (localConnection) {
            await localConnection.close();
            console.log('\n🔌 Conexión local cerrada');
        }
        if (atlasConnection) {
            await atlasConnection.close();
            console.log('🔌 Conexión Atlas cerrada');
        }
    }
}

// Función para verificar conexión a Atlas
async function testAtlasConnection() {
    try {
        console.log('🧪 Probando conexión a MongoDB Atlas...');
        const connection = await mongoose.createConnection(ATLAS_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        await connection.close();
        console.log('✅ Conexión a Atlas exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Atlas:', error.message);
        return false;
    }
}

// Ejecutar
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        await testAtlasConnection();
    } else {
        await exportToAtlas();
    }
}

main(); 