import mongoose from 'mongoose';

const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function debugAtlas() {
    try {
        console.log('🔍 Debug de Atlas - Verificando conexión y datos...\n');
        
        const connection = await mongoose.connect(CORPORATE_URI);
        const db = connection.connection.db;
        
        console.log('📊 Información de conexión:');
        console.log(`   Host: ${connection.connection.host}`);
        console.log(`   Database: ${db.databaseName}`);
        console.log(`   Ready State: ${connection.connection.readyState}`);
        
        // Listar todas las bases de datos
        console.log('\n🗄️ Bases de datos disponibles:');
        const databases = await connection.db.admin().listDatabases();
        databases.databases.forEach(db => {
            console.log(`   - ${db.name} (${(db.sizeOnDisk/1024/1024).toFixed(2)} MB)`);
        });
        
        // Listar colecciones en la base de datos actual
        console.log('\n📋 Colecciones en la base de datos actual:');
        const collections = await db.listCollections().toArray();
        console.log(`   Base de datos: ${db.databaseName}`);
        
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            const stats = await db.collection(collection.name).stats();
            console.log(`   📦 ${collection.name}: ${count} documentos (${(stats.size/1024).toFixed(2)} KB)`);
        }
        
        // Verificar usuarios específicamente
        console.log('\n👥 Verificación detallada de usuarios:');
        const usuarios = await db.collection('usuarios').find({}).toArray();
        console.log(`   Total usuarios: ${usuarios.length}`);
        
        usuarios.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.usuario} (${user.rol})`);
        });
        
        await connection.disconnect();
        console.log('\n🔌 Conexión cerrada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugAtlas();
