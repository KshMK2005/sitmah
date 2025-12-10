import mongoose from 'mongoose';

// Cadenas de conexión
const SOURCE_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const TARGET_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/sitmah?retryWrites=true&w=majority&appName=sitmah';

async function migrateToCorporate() {
    try {
        console.log('🚀 Migrando datos a cuenta corporativa...\n');
        
        // Conectar a cuenta personal (fuente)
        console.log('📡 Conectando a cuenta personal...');
        const sourceConn = await mongoose.connect(SOURCE_URI);
        const sourceDb = sourceConn.connection.db;
        console.log(`✅ Conectado a cuenta personal: ${sourceDb.databaseName}`);
        
        // Conectar a cuenta corporativa (destino)
        console.log('\n🏢 Conectando a cuenta corporativa...');
        const targetConn = await mongoose.createConnection(TARGET_URI);
        const targetDb = targetConn.db;
        console.log(`✅ Conectado a cuenta corporativa: ${targetDb.databaseName}`);
        
        // Colecciones a migrar
        const collections = ['usuarios', 'operadors', 'configuracions', 'aperturas', 'programacions'];
        
        let totalMigrated = 0;
        
        for (const collectionName of collections) {
            console.log(`\n📦 Migrando ${collectionName}...`);
            
            try {
                // Obtener datos de la fuente
                const documents = await sourceDb.collection(collectionName).find({}).toArray();
                console.log(`   📄 Documentos en fuente: ${documents.length}`);
                
                if (documents.length > 0) {
                    // Limpiar destino
                    await targetDb.collection(collectionName).deleteMany({});
                    console.log(`   🧹 Destino limpiado`);
                    
                    // Migrar datos
                    await targetDb.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ ${documents.length} documentos migrados`);
                    totalMigrated += documents.length;
                } else {
                    console.log(`   ℹ️  No hay documentos para migrar`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error migrando ${collectionName}: ${error.message}`);
            }
        }
        
        // Verificar migración
        console.log('\n🔍 Verificando migración...');
        for (const collectionName of collections) {
            try {
                const count = await targetDb.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 ¡Migración a cuenta corporativa completada!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        
        console.log('\n📝 Próximos pasos:');
        console.log('1. ✅ Datos migrados a cuenta corporativa');
        console.log('2. 🔄 Actualizar MONGODB_URI en Vercel con la cadena corporativa');
        console.log('3. 🚀 Hacer redeploy en Vercel');
        console.log('4. 🧪 Probar la aplicación');
        
        // Cerrar conexiones
        await sourceConn.disconnect();
        await targetConn.close();
        console.log('\n🔌 Conexiones cerradas');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

migrateToCorporate();
