import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://sitmah.vercel.app';

async function checkStatus() {
    console.log('🔍 Verificando estado de la aplicación...\n');
    
    try {
        // 1. Verificar si la aplicación responde
        console.log('1️⃣ Verificando respuesta de la aplicación...');
        const appResponse = await fetch(PRODUCTION_URL);
        console.log(`   Status: ${appResponse.status} ${appResponse.statusText}`);
        
        if (appResponse.ok) {
            console.log('   ✅ Aplicación respondiendo correctamente');
        } else {
            console.log('   ❌ Aplicación no responde correctamente');
        }
        
        // 2. Verificar API básica
        console.log('\n2️⃣ Verificando API básica...');
        const apiResponse = await fetch(`${PRODUCTION_URL}/api/configuracion`);
        console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
        
        if (apiResponse.ok) {
            console.log('   ✅ API respondiendo correctamente');
        } else {
            console.log('   ❌ API no responde correctamente');
        }
        
        // 3. Verificar configuración temaGlobal
        console.log('\n3️⃣ Verificando configuración temaGlobal...');
        const temaResponse = await fetch(`${PRODUCTION_URL}/api/configuracion/temaGlobal`);
        console.log(`   Status: ${temaResponse.status} ${temaResponse.statusText}`);
        
        if (temaResponse.ok) {
            const temaData = await temaResponse.json();
            console.log(`   ✅ Configuración temaGlobal encontrada: ${temaData.valor}`);
        } else {
            console.log('   ❌ Configuración temaGlobal no encontrada');
            console.log('   💡 Esto es normal en el primer despliegue');
        }
        
        console.log('\n📋 Resumen:');
        console.log('   - La aplicación debería funcionar correctamente');
        console.log('   - Los errores 404 de temaGlobal son normales inicialmente');
        console.log('   - El sistema usará valores por defecto automáticamente');
        console.log('   - La configuración se creará automáticamente al usar la app');
        
    } catch (error) {
        console.error('\n❌ Error al verificar estado:', error.message);
        console.log('\n💡 Posibles causas:');
        console.log('   - El despliegue en Vercel aún no está completo');
        console.log('   - Problemas de conectividad');
        console.log('   - La URL de producción no es correcta');
    }
}

// Ejecutar verificación
checkStatus(); 