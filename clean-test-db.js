import mongoose from 'mongoose';

// Conectar directamente a la base de datos "test" para limpiarla
const TEST_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/test?retryWrites=true&w=majority&appName=sitmah';

async function cleanTestDatabase() {
    try {
        console.log('🧹 Limpiando base de datos "test"...\n');
        
        const connection = await mongoose.connect(TEST_URI);
        const db = connection.connection.db;
        
        console.log(`📊 Conectado a: ${db.databaseName}`);
        
        // Listar colecciones
        const collections = await db.listCollections().toArray();
        console.log(`📋 Colecciones encontradas: ${collections.length}`);
        
        // Limpiar cada colección
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            try {
                const count = await db.collection(collectionName).countDocuments();
                console.log(`📦 ${collectionName}: ${count} documentos`);
                
                if (count > 0) {
                    await db.collection(collectionName).deleteMany({});
                    console.log(`   ✅ ${collectionName} limpiada (${count} documentos eliminados)`);
                }
            } catch (error) {
                console.log(`   ❌ Error limpiando ${collectionName}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 ¡Base de datos "test" limpiada!');
        console.log('📝 Ahora la aplicación debería funcionar sin errores de duplicados');
        
        await connection.disconnect();
        console.log('\n🔌 Conexión cerrada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanTestDatabase();
