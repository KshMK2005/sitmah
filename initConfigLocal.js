import dotenv from 'dotenv';

dotenv.config();

async function initConfigLocal() {
    console.log('🔧 Verificando configuración local...\n');
    
    try {
        // Verificar si MONGODB_URI está configurada
        if (!process.env.MONGODB_URI) {
            console.log('⚠️  MONGODB_URI no configurada localmente');
            console.log('   Esto es normal en desarrollo local');
            console.log('   La configuración se inicializará automáticamente en producción');
            console.log('\n✅ El sistema funcionará correctamente con valores por defecto');
            return;
        }
        
        console.log('✅ MONGODB_URI configurada, procediendo con inicialización...');
        console.log('   Para inicializar la configuración en producción, ejecuta:');
        console.log('   npm run init-config');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Ejecutar verificación
initConfigLocal(); 