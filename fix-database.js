import mongoose from 'mongoose';

// Cadenas de conexión
const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/sitmah?retryWrites=true&w=majority&appName=sitmah';

async function fixDatabase() {
    try {
        console.log('🔧 Arreglando configuración de base de datos...\n');
        
        // 1. Conectar a la base de datos actual (personal)
        console.log('📡 Conectando a base de datos personal...');
        const currentConn = await mongoose.connect(CURRENT_URI);
        const currentDb = currentConn.connection.db;
        console.log('✅ Conectado a base de datos personal');
        
        // 2. Conectar a la base de datos corporativa
        console.log('\n🏢 Conectando a base de datos corporativa...');
        const corporateConn = await mongoose.createConnection(CORPORATE_URI);
        const corporateDb = corporateConn.db;
        console.log('✅ Conectado a base de datos corporativa');
        
        // 3. Limpiar completamente la base de datos corporativa
        console.log('\n🧹 Limpiando base de datos corporativa...');
        const collections = ['usuarios', 'operadors', 'configuracions', 'aperturas', 'programacions'];
        
        for (const collectionName of collections) {
            try {
                await corporateDb.collection(collectionName).deleteMany({});
                console.log(`   ✅ ${collectionName} limpiada`);
            } catch (error) {
                console.log(`   ⚠️  ${collectionName}: ${error.message}`);
            }
        }
        
        // 4. Migrar datos frescos desde la base personal
        console.log('\n📦 Migrando datos frescos...');
        let totalMigrated = 0;
        
        for (const collectionName of collections) {
            try {
                const documents = await currentDb.collection(collectionName).find({}).toArray();
                
                if (documents.length > 0) {
                    await corporateDb.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ ${collectionName}: ${documents.length} documentos migrados`);
                    totalMigrated += documents.length;
                } else {
                    console.log(`   ℹ️  ${collectionName}: No hay documentos`);
                }
            } catch (error) {
                console.log(`   ❌ Error migrando ${collectionName}: ${error.message}`);
            }
        }
        
        // 5. Verificar migración
        console.log('\n🔍 Verificando migración...');
        for (const collectionName of collections) {
            try {
                const count = await corporateDb.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 ¡Base de datos arreglada!');
        console.log(`📊 Total de documentos migrados: ${totalMigrated}`);
        
        console.log('\n📝 Próximos pasos:');
        console.log('1. ✅ Base de datos corporativa limpia y migrada');
        console.log('2. 🔄 Hacer redeploy en Vercel');
        console.log('3. 🧪 Probar la aplicación');
        
        // Cerrar conexiones
        await currentConn.disconnect();
        await corporateConn.close();
        console.log('\n🔌 Conexiones cerradas');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixDatabase();
