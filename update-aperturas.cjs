const https = require('https');

console.log('🔄 Actualizando aperturas pendientes...');

const updateAperturas = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      estado: 'dashboard',
      horaProgramada: '05:30'
    });
    
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura/update-pendientes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Aperturas actualizadas exitosamente');
          console.log('📋 Resultado:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ Error parseando respuesta:', error.message);
          console.log('📄 Respuesta del servidor:', data);
          reject(error);
        }
      });
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

    req.write(postData);
    req.end();
  });
};

async function main() {
  try {
    await updateAperturas();
    console.log('');
    console.log('🎉 ¡Todas las aperturas pendientes han sido actualizadas!');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error.message);
  }
}

main(); 