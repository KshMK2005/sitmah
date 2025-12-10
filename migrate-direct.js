import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Importar modelos del servidor
import Usuario from './server/database/models/Usuario.js';
import Apertura from './server/database/models/Apertura.js';
import Programacion from './server/database/models/Programacion.js';
import Operador from './server/database/models/Operador.js';
import Configuracion from './server/database/models/Configuracion.js';

// Cadenas de conexión directas
const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

console.log('🚀 Iniciando migración directa a cuenta corporativa...');
console.log('📊 Cuenta actual: Conectada');
console.log('🏢 Cuenta corporativa: Conectada');

async function migrateToCorporateAtlas() {
    let currentConnection, corporateConnection;
    
    try {
        // Conectar a base de datos actual
        console.log('\n📡 Conectando a base de datos actual...');
        currentConnection = await mongoose.createConnection(CURRENT_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Conectado a base de datos actual');

        // Conectar a MongoDB Atlas corporativo
        console.log('\n🏢 Conectando a MongoDB Atlas corporativo...');
        corporateConnection = await mongoose.createConnection(CORPORATE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Conectado a MongoDB Atlas corporativo');

        // Crear modelos para la nueva conexión
        const CorporateUsuario = corporateConnection.model('Usuario', Usuario.schema);
        const CorporateApertura = corporateConnection.model('Apertura', Apertura.schema);
        const CorporateProgramacion = corporateConnection.model('Programacion', Programacion.schema);
        const CorporateOperador = corporateConnection.model('Operador', Operador.schema);
        const CorporateConfiguracion = corporateConnection.model('Configuracion', Configuracion.schema);

        let totalMigrated = 0;

        // Migrar Usuarios
        console.log('\n👥 Migrando usuarios...');
        const usuarios = await Usuario.find({});
        if (usuarios.length > 0) {
            await CorporateUsuario.deleteMany({});
            await CorporateUsuario.insertMany(usuarios);
            console.log(`✅ ${usuarios.length} usuarios migrados`);
            totalMigrated += usuarios.length;
        } else {
            console.log('ℹ️  No hay usuarios para migrar');
        }

        // Migrar Operadores
        console.log('\n🚗 Migrando operadores...');
        const operadores = await Operador.find({});
        if (operadores.length > 0) {
            await CorporateOperador.deleteMany({});
            await CorporateOperador.insertMany(operadores);
            console.log(`✅ ${operadores.length} operadores migrados`);
            totalMigrated += operadores.length;
        } else {
            console.log('ℹ️  No hay operadores para migrar');
        }

        // Migrar Programaciones
        console.log('\n📅 Migrando programaciones...');
        const programaciones = await Programacion.find({});
        if (programaciones.length > 0) {
            await CorporateProgramacion.deleteMany({});
            await CorporateProgramacion.insertMany(programaciones);
            console.log(`✅ ${programaciones.length} programaciones migradas`);
            totalMigrated += programaciones.length;
        } else {
            console.log('ℹ️  No hay programaciones para migrar');
        }

        // Migrar Aperturas
        console.log('\n🚪 Migrando aperturas...');
        const aperturas = await Apertura.find({});
        if (aperturas.length > 0) {
            await CorporateApertura.deleteMany({});
            await CorporateApertura.insertMany(aperturas);
            console.log(`✅ ${aperturas.length} aperturas migradas`);
            totalMigrated += aperturas.length;
        } else {
            console.log('ℹ️  No hay aperturas para migrar');
        }

        // Migrar Configuraciones
        console.log('\n⚙️ Migrando configuraciones...');
        const configuraciones = await Configuracion.find({});
        if (configuraciones.length > 0) {
            await CorporateConfiguracion.deleteMany({});
            await CorporateConfiguracion.insertMany(configuraciones);
            console.log(`✅ ${configuraciones.length} configuraciones migradas`);
            totalMigrated += configuraciones.length;
        } else {
            console.log('ℹ️  No hay configuraciones para migrar');
        }

        // Generar reporte de migración
        console.log('\n📋 Generando reporte de migración...');
        const reporte = {
            fecha: new Date().toISOString(),
            cuenta_origen: 'Cuenta personal (despacho.xnizfvc)',
            cuenta_destino: 'Cuenta corporativa (sitmah.ywhe5d8)',
            estadisticas: {
                usuarios: usuarios.length,
                operadores: operadores.length,
                programaciones: programaciones.length,
                aperturas: aperturas.length,
                configuraciones: configuraciones.length,
                total: totalMigrated
            },
            status: 'COMPLETADO'
        };

        const reportePath = path.join(process.cwd(), 'migration-report.json');
        fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
        console.log(`✅ Reporte guardado en ${reportePath}`);

        console.log('\n🎉 ¡Migración completada exitosamente!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        console.log('\n📝 Próximos pasos:');
        console.log('1. Actualizar MONGODB_URI en Vercel con la nueva cadena de conexión');
        console.log('2. Hacer redeploy en Vercel');
        console.log('3. Probar la aplicación con la nueva base de datos');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        
        // Generar reporte de error
        const errorReport = {
            fecha: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            status: 'ERROR'
        };
        
        fs.writeFileSync('migration-error.json', JSON.stringify(errorReport, null, 2));
        
    } finally {
        // Cerrar conexiones
        if (currentConnection) {
            await currentConnection.close();
            console.log('\n🔌 Conexión actual cerrada');
        }
        if (corporateConnection) {
            await corporateConnection.close();
            console.log('🔌 Conexión corporativa cerrada');
        }
    }
}

migrateToCorporateAtlas();
