const https = require('https');

console.log('🔍 Verificando estado del servidor...');

// Verificar el endpoint de configuración
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/configuracion/temaGlobal',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      console.log(`📡 Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Servidor respondiendo correctamente');
      } else {
        console.log('⚠️ Servidor respondiendo pero con status diferente');
      }
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log('❌ Error conectando al servidor:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout conectando al servidor');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Verificar el modelo de apertura
const checkAperturaModel = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      console.log(`📡 Apertura API Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ API de apertura funcionando');
      } else {
        console.log('⚠️ API de apertura con problemas');
      }
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log('❌ Error en API de apertura:', err.message);
      reject(err);
    });

    req.end();
  });
};

async function main() {
  try {
    console.log('🚀 Iniciando verificación del servidor...\n');
    
    await checkServer();
    console.log('');
    await checkAperturaModel();
    
    console.log('\n📋 Resumen:');
    console.log('- Si ambos endpoints responden, el servidor está funcionando');
    console.log('- Los cambios en el modelo pueden tardar unos minutos en propagarse');
    console.log('- Si persisten los errores, puede ser necesario reiniciar el servidor');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

main(); 