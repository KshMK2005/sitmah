import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://sitmah.vercel.app';

async function initConfigRemote() {
    console.log('🔧 Inicializando configuración en producción...\n');
    
    try {
        console.log('1️⃣ Conectando a la API de producción...');
        
        const response = await fetch(`${PRODUCTION_URL}/api/configuracion/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        console.log('✅ Configuración inicializada exitosamente!');
        console.log('📋 Resultado:', result.message);
        
        if (result.configuraciones) {
            console.log('\n📝 Configuraciones creadas:');
            result.configuraciones.forEach(config => {
                console.log(`   - ${config.nombre}: ${config.valor}`);
            });
        }
        
        console.log('\n🎉 ¡La configuración está lista en producción!');
        console.log('🌐 URL: https://sitmah.vercel.app');
        
    } catch (error) {
        console.error('\n❌ Error al inicializar configuración:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('\n💡 Sugerencias:');
            console.log('   - Verifica que la URL de producción sea correcta');
            console.log('   - Asegúrate de que el servidor esté funcionando');
            console.log('   - Revisa los logs de Vercel');
        }
        
        process.exit(1);
    }
}

// Ejecutar inicialización
initConfigRemote(); 