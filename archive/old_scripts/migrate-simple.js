import mongoose from 'mongoose';
import fs from 'fs';

// Cadenas de conexión
const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function migrateSimple() {
    let currentConn, corporateConn;
    
    try {
        console.log('🚀 Iniciando migración simple...\n');
        
        // Conectar a base de datos actual
        console.log('📡 Conectando a base de datos actual...');
        currentConn = await mongoose.createConnection(CURRENT_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ Conectado a base de datos actual');

        // Conectar a base de datos corporativa
        console.log('\n🏢 Conectando a base de datos corporativa...');
        corporateConn = await mongoose.createConnection(CORPORATE_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log('✅ Conectado a base de datos corporativa');

        // Obtener colecciones de la base actual
        const collections = await currentConn.db.listCollections().toArray();
        console.log(`\n📋 Colecciones encontradas: ${collections.length}`);
        
        let totalMigrated = 0;
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n📦 Migrando colección: ${collectionName}`);
            
            try {
                // Obtener todos los documentos de la colección
                const documents = await currentConn.db.collection(collectionName).find({}).toArray();
                console.log(`   📄 Documentos encontrados: ${documents.length}`);
                
                if (documents.length > 0) {
                    // Limpiar colección en destino
                    await corporateConn.db.collection(collectionName).deleteMany({});
                    
                    // Insertar documentos
                    await corporateConn.db.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ ${documents.length} documentos migrados`);
                    totalMigrated += documents.length;
                } else {
                    console.log(`   ℹ️  Colección vacía, saltando...`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error migrando ${collectionName}:`, error.message);
            }
        }

        // Generar reporte
        console.log('\n📋 Generando reporte...');
        const reporte = {
            fecha: new Date().toISOString(),
            colecciones: collections.map(c => c.name),
            total_documentos: totalMigrated,
            status: 'COMPLETADO'
        };
        
        fs.writeFileSync('migration-report.json', JSON.stringify(reporte, null, 2));
        console.log('✅ Reporte guardado en migration-report.json');

        console.log('\n🎉 ¡Migración completada!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        console.log(`📋 Colecciones migradas: ${collections.length}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
    } finally {
        if (currentConn) await currentConn.close();
        if (corporateConn) await corporateConn.close();
        console.log('\n🔌 Conexiones cerradas');
    }
}

migrateSimple();
