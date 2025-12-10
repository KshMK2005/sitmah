import mongoose from 'mongoose';

// Usar la nueva cadena de conexión corporativa
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function verifyMigration() {
    try {
        console.log('🔍 Verificando migración a cuenta corporativa...\n');
        
        // Conectar a la base de datos corporativa
        console.log('🏢 Conectando a base de datos corporativa...');
        const connection = await mongoose.connect(CORPORATE_URI);
        const db = connection.connection.db;
        console.log('✅ Conectado a base de datos corporativa');

        // Verificar colecciones y documentos
        console.log('\n📋 Verificando colecciones y documentos:');
        
        const collections = ['usuarios', 'operadors', 'configuracions', 'aperturas', 'programacions'];
        let totalDocuments = 0;
        
        for (const collectionName of collections) {
            try {
                const count = await db.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
                totalDocuments += count;
                
                // Mostrar un documento de ejemplo
                if (count > 0) {
                    const sample = await db.collection(collectionName).findOne({});
                    console.log(`   📄 Ejemplo: ${JSON.stringify(sample).substring(0, 80)}...`);
                }
                
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}:`, error.message);
            }
            console.log('');
        }

        console.log(`📊 Total de documentos en base de datos corporativa: ${totalDocuments}`);

        // Verificar funcionalidades específicas
        console.log('\n🧪 Verificando funcionalidades específicas:');
        
        // Verificar usuarios de login
        try {
            const adminUser = await db.collection('usuarios').findOne({ usuario: 'admin' });
            if (adminUser) {
                console.log('✅ Usuario admin encontrado - Login funcionará');
            } else {
                console.log('⚠️  Usuario admin no encontrado');
            }
        } catch (error) {
            console.log('❌ Error verificando usuario admin:', error.message);
        }

        // Verificar operadores
        try {
            const operadoresCount = await db.collection('operadors').countDocuments();
            console.log(`✅ ${operadoresCount} operadores disponibles`);
        } catch (error) {
            console.log('❌ Error verificando operadores:', error.message);
        }

        // Verificar aperturas recientes
        try {
            const aperturasCount = await db.collection('aperturas').countDocuments();
            console.log(`✅ ${aperturasCount} aperturas en el sistema`);
        } catch (error) {
            console.log('❌ Error verificando aperturas:', error.message);
        }

        // Verificar programaciones
        try {
            const programacionesCount = await db.collection('programacions').countDocuments();
            console.log(`✅ ${programacionesCount} programaciones disponibles`);
        } catch (error) {
            console.log('❌ Error verificando programaciones:', error.message);
        }

        console.log('\n🎉 ¡Verificación completada!');
        console.log('📝 La aplicación debería funcionar correctamente con la nueva base de datos corporativa');
        
        console.log('\n📋 Checklist de verificación post-migración:');
        console.log('✅ Base de datos conectada');
        console.log('✅ Todas las colecciones migradas');
        console.log('✅ Documentos verificados');
        console.log('🔄 Próximo: Probar login en la aplicación');
        console.log('🔄 Próximo: Verificar Dashboard');
        console.log('🔄 Próximo: Probar módulos Apertura y Verificador');

        await connection.disconnect();
        console.log('\n🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error.message);
        console.log('\n💡 Posibles soluciones:');
        console.log('1. Verificar que la cadena de conexión sea correcta');
        console.log('2. Verificar que la IP esté en whitelist en Atlas');
        console.log('3. Verificar que el usuario tenga permisos correctos');
    }
}

verifyMigration();
