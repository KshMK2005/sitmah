import mongoose from 'mongoose';

// Nueva cadena de conexión corregida
const NEW_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/sitmah?retryWrites=true&w=majority&appName=sitmah';

async function testNewConnection() {
    try {
        console.log('🧪 Probando nueva cadena de conexión...\n');
        
        const connection = await mongoose.connect(NEW_URI);
        const db = connection.connection.db;
        
        console.log('✅ Conexión exitosa');
        console.log(`📊 Base de datos: ${db.databaseName}`);
        
        // Verificar colecciones
        const collections = await db.listCollections().toArray();
        console.log(`\n📋 Colecciones encontradas: ${collections.length}`);
        
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`📦 ${collection.name}: ${count} documentos`);
        }
        
        await connection.disconnect();
        console.log('\n🔌 Conexión cerrada');
        console.log('✅ La nueva cadena de conexión funciona correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testNewConnection();
