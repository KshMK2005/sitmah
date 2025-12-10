import mongoose from 'mongoose';

// Probar ambas cadenas de conexión
const TEST_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';
const SITMAH_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/sitmah?retryWrites=true&w=majority&appName=sitmah';

async function checkDatabases() {
    console.log('🔍 Verificando ambas bases de datos...\n');
    
    // Probar conexión a "test" (sin especificar base de datos)
    try {
        console.log('📡 Conectando a base de datos "test" (cadena sin /sitmah)...');
        const testConn = await mongoose.createConnection(TEST_URI);
        const testDb = testConn.connection.db;
        
        console.log(`✅ Conectado a: ${testDb.databaseName}`);
        
        // Verificar aperturas
        const aperturasTest = await testDb.collection('aperturas').find({}).toArray();
        console.log(`📊 Aperturas en "${testDb.databaseName}": ${aperturasTest.length}`);
        
        if (aperturasTest.length > 0) {
            console.log(`   📄 Última apertura: Económico ${aperturasTest[aperturasTest.length - 1].economico}`);
        }
        
        await testConn.close();
        
    } catch (error) {
        console.log('❌ Error conectando a "test":', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Probar conexión a "sitmah" (con /sitmah especificado)
    try {
        console.log('📡 Conectando a base de datos "sitmah" (cadena con /sitmah)...');
        const sitmahConn = await mongoose.createConnection(SITMAH_URI);
        const sitmahDb = sitmahConn.connection.db;
        
        console.log(`✅ Conectado a: ${sitmahDb.databaseName}`);
        
        // Verificar aperturas
        const aperturasSitmah = await sitmahDb.collection('aperturas').find({}).toArray();
        console.log(`📊 Aperturas en "${sitmahDb.databaseName}": ${aperturasSitmah.length}`);
        
        if (aperturasSitmah.length > 0) {
            console.log(`   📄 Última apertura: Económico ${aperturasSitmah[aperturasSitmah.length - 1].economico}`);
        }
        
        await sitmahConn.close();
        
    } catch (error) {
        console.log('❌ Error conectando a "sitmah":', error.message);
    }
    
    console.log('\n🎯 CONCLUSIÓN:');
    console.log('La aplicación probablemente se está conectando a la base de datos que tiene más datos.');
    console.log('Necesitamos limpiar la base de datos correcta y migrar los datos ahí.');
}

checkDatabases();
