const https = require('https');

console.log('🔄 Moviendo aperturas a estado estable en Verificador...');

const moveToVerificacionStable = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      estado: 'en_verificacion'
    });
    
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura/move-to-verificacion-stable',
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
          console.log('✅ Aperturas movidas a estado estable exitosamente');
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
    await moveToVerificacionStable();
    console.log('');
    console.log('🎉 ¡Todas las aperturas están ahora en estado estable en el Verificador!');
    console.log('📋 Estado: en_verificacion (NO pendiente, NO dashboard)');
  } catch (error) {
    console.error('❌ Error durante el movimiento:', error.message);
  }
}

main(); 