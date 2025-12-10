import mongoose from 'mongoose';

const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';

async function checkCollections() {
    try {
        console.log('🔍 Verificando colecciones en base de datos actual...\n');
        
        const connection = await mongoose.connect(CURRENT_URI);
        const db = connection.connection.db;
        
        // Listar colecciones
        const collections = await db.listCollections().toArray();
        console.log(`📋 Colecciones encontradas: ${collections.length}\n`);
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            
            console.log(`📦 ${collectionName}: ${count} documentos`);
            
            // Mostrar algunos documentos de ejemplo
            if (count > 0) {
                const sample = await collection.findOne({});
                console.log(`   📄 Ejemplo: ${JSON.stringify(sample, null, 2).substring(0, 100)}...`);
            }
            console.log('');
        }
        
        await connection.disconnect();
        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCollections();
