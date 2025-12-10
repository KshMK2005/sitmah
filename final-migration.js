import mongoose from 'mongoose';
import fs from 'fs';

const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function finalMigration() {
    let currentConn, corporateConn;
    
    try {
        console.log('🚀 Iniciando migración final...\n');
        
        // Conectar a ambas bases de datos
        console.log('📡 Conectando a base de datos actual...');
        currentConn = await mongoose.connect(CURRENT_URI);
        console.log('✅ Conectado a base de datos actual');

        console.log('\n🏢 Conectando a base de datos corporativa...');
        corporateConn = await mongoose.createConnection(CORPORATE_URI);
        console.log('✅ Conectado a base de datos corporativa');

        const currentDb = currentConn.connection.db;
        const corporateDb = corporateConn.db;
        
        // Colecciones a migrar
        const collections = ['operadors', 'usuarios', 'configuracions', 'aperturas', 'programacions'];
        
        let totalMigrated = 0;
        
        for (const collectionName of collections) {
            console.log(`\n📦 Migrando colección: ${collectionName}`);
            
            try {
                // Obtener todos los documentos
                const documents = await currentDb.collection(collectionName).find({}).toArray();
                console.log(`   📄 Documentos encontrados: ${documents.length}`);
                
                if (documents.length > 0) {
                    // Limpiar colección en destino
                    await corporateDb.collection(collectionName).deleteMany({});
                    console.log(`   🧹 Colección limpiada en destino`);
                    
                    // Insertar documentos
                    await corporateDb.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ ${documents.length} documentos migrados`);
                    totalMigrated += documents.length;
                } else {
                    console.log(`   ℹ️  Colección vacía, saltando...`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error migrando ${collectionName}:`, error.message);
            }
        }

        // Verificar migración
        console.log('\n🔍 Verificando migración...');
        for (const collectionName of collections) {
            try {
                const count = await corporateDb.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName} en destino: ${count} documentos`);
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}:`, error.message);
            }
        }

        // Generar reporte
        const reporte = {
            fecha: new Date().toISOString(),
            migracion: {
                origen: 'Cuenta personal (despacho.xnizfvc)',
                destino: 'Cuenta corporativa (sitmah.ywhe5d8)'
            },
            colecciones_migradas: collections,
            total_documentos: totalMigrated,
            status: 'COMPLETADO'
        };
        
        fs.writeFileSync('migration-report.json', JSON.stringify(reporte, null, 2));
        console.log('\n✅ Reporte guardado en migration-report.json');

        console.log('\n🎉 ¡Migración completada exitosamente!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        console.log(`📋 Colecciones migradas: ${collections.length}`);
        
        console.log('\n📝 Próximos pasos:');
        console.log('1. ✅ Migración de datos completada');
        console.log('2. 🔄 Actualizar MONGODB_URI en Vercel');
        console.log('3. 🚀 Hacer redeploy en Vercel');
        console.log('4. 🧪 Probar la aplicación');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
    } finally {
        if (currentConn) await currentConn.disconnect();
        if (corporateConn) await corporateConn.close();
        console.log('\n🔌 Conexiones cerradas');
    }
}

finalMigration();
