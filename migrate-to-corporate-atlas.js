import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Importar modelos del servidor
import Usuario from './server/database/models/Usuario.js';
import Apertura from './server/database/models/Apertura.js';
import Programacion from './server/database/models/Programacion.js';
import Operador from './server/database/models/Operador.js';
import Configuracion from './server/database/models/Configuracion.js';

// Cargar variables de entorno
dotenv.config();

// Configuración de conexiones
const CURRENT_ATLAS_URI = process.env.MONGODB_URI; // Tu cuenta actual
const CORPORATE_ATLAS_URI = process.env.CORPORATE_MONGODB_URI; // Nueva cuenta corporativa

console.log('🚀 Iniciando migración a cuenta corporativa de MongoDB Atlas...');
console.log('📊 Cuenta actual:', CURRENT_ATLAS_URI ? CURRENT_ATLAS_URI.replace(/\/\/.*@/, '//***:***@') : 'No configurada');
console.log('🏢 Cuenta corporativa:', CORPORATE_ATLAS_URI ? CORPORATE_ATLAS_URI.replace(/\/\/.*@/, '//***:***@') : 'No configurada');

async function migrateToCorporateAtlas() {
    let currentConnection, corporateConnection;
    
    try {
        // Validar variables de entorno
        if (!CURRENT_ATLAS_URI) {
            throw new Error('MONGODB_URI no está configurada. Necesitas la cadena de conexión de tu cuenta actual.');
        }
        
        if (!CORPORATE_ATLAS_URI) {
            throw new Error('CORPORATE_MONGODB_URI no está configurada. Necesitas la cadena de conexión de la cuenta corporativa.');
        }

        // Conectar a base de datos actual
        console.log('\n📡 Conectando a base de datos actual (cuenta personal)...');
        currentConnection = await mongoose.createConnection(CURRENT_ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Conectado a base de datos actual');

        // Conectar a MongoDB Atlas corporativo
        console.log('\n🏢 Conectando a MongoDB Atlas corporativo...');
        corporateConnection = await mongoose.createConnection(CORPORATE_ATLAS_URI, {
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
            // Limpiar usuarios existentes en la cuenta corporativa (opcional)
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
            cuenta_origen: CURRENT_ATLAS_URI.replace(/\/\/.*@/, '//***:***@'),
            cuenta_destino: CORPORATE_ATLAS_URI.replace(/\/\/.*@/, '//***:***@'),
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

        const reportePath = path.join(__dirname, 'migration-report.json');
        fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
        console.log(`✅ Reporte guardado en ${reportePath}`);

        console.log('\n🎉 ¡Migración completada exitosamente!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        console.log('\n📝 Próximos pasos:');
        console.log('1. Actualizar la variable MONGODB_URI en Vercel con la nueva cadena de conexión');
        console.log('2. Actualizar las variables de entorno locales');
        console.log('3. Probar la aplicación con la nueva base de datos');
        console.log('4. Verificar que todos los datos se vean correctamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Solución: Verifica que las cadenas de conexión sean correctas');
            console.log('   Asegúrate de que las cuentas corporativas estén configuradas correctamente');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solución: Verifica que las cuentas de MongoDB Atlas estén activas');
        }
        
        if (error.code === 11000) {
            console.log('\n💡 Error de duplicados - algunos documentos ya existen');
        }

        // Generar reporte de error
        const errorReport = {
            fecha: new Date().toISOString(),
            error: error.message,
            code: error.code,
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

// Función para verificar conexiones
async function testConnections() {
    console.log('🧪 Probando conexiones...');
    
    try {
        if (CURRENT_ATLAS_URI) {
            console.log('📡 Probando conexión actual...');
            const currentConn = await mongoose.createConnection(CURRENT_ATLAS_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            await currentConn.close();
            console.log('✅ Conexión actual exitosa');
        } else {
            console.log('⚠️  MONGODB_URI no configurada');
        }

        if (CORPORATE_ATLAS_URI) {
            console.log('🏢 Probando conexión corporativa...');
            const corporateConn = await mongoose.createConnection(CORPORATE_ATLAS_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            await corporateConn.close();
            console.log('✅ Conexión corporativa exitosa');
        } else {
            console.log('⚠️  CORPORATE_MONGODB_URI no configurada');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error en conexiones:', error.message);
        return false;
    }
}

// Función para generar script de actualización de variables de entorno
function generateEnvUpdateScript() {
    const script = `
# Script para actualizar variables de entorno después de la migración

# Para desarrollo local (.env)
echo "MONGODB_URI=${CORPORATE_ATLAS_URI}" > .env

# Para Vercel (usar vercel CLI)
vercel env add MONGODB_URI production
# Luego pegar: ${CORPORATE_ATLAS_URI}

# Verificar variables
vercel env ls
`;

    fs.writeFileSync('update-env-vars.sh', script);
    console.log('📝 Script de actualización de variables generado: update-env-vars.sh');
}

// Ejecutar
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        await testConnections();
    } else if (args.includes('--generate-script')) {
        generateEnvUpdateScript();
    } else {
        await migrateToCorporateAtlas();
    }
}

main();
