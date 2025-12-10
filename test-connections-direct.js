import mongoose from 'mongoose';

// Cadenas de conexión directas
const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function testConnections() {
    console.log('🧪 Probando conexiones directas...\n');
    
    // Probar conexión actual
    try {
        console.log('📡 Probando conexión actual...');
        const currentConn = await mongoose.createConnection(CURRENT_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ Conexión actual exitosa');
        console.log('📊 Base de datos:', currentConn.db.databaseName);
        
        // Contar documentos
        const collections = ['usuarios', 'aperturas', 'operadores', 'programaciones', 'configuraciones'];
        let totalDocs = 0;
        
        for (const collectionName of collections) {
            try {
                const count = await currentConn.db.collection(collectionName).countDocuments();
                console.log(`📋 ${collectionName}: ${count} documentos`);
                totalDocs += count;
            } catch (error) {
                console.log(`📋 ${collectionName}: No existe`);
            }
        }
        
        console.log(`📊 Total de documentos en cuenta actual: ${totalDocs}\n`);
        
        await currentConn.close();
        
    } catch (error) {
        console.error('❌ Error en conexión actual:', error.message);
    }
    
    // Probar conexión corporativa
    try {
        console.log('🏢 Probando conexión corporativa...');
        const corporateConn = await mongoose.createConnection(CORPORATE_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ Conexión corporativa exitosa');
        console.log('📊 Base de datos:', corporateConn.db.databaseName);
        
        // Verificar si hay colecciones
        const collections = await corporateConn.db.listCollections().toArray();
        console.log(`📋 Colecciones existentes: ${collections.length}`);
        
        for (const collection of collections) {
            console.log(`   - ${collection.name}`);
        }
        
        await corporateConn.close();
        
    } catch (error) {
        console.error('❌ Error en conexión corporativa:', error.message);
    }
}

testConnections();
