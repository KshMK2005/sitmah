const https = require('https');

console.log('🔄 Moviendo aperturas al Verificador...');

const moveToVerificador = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      estado: 'pendiente'
    });
    
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura/move-to-verificador',
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
          console.log('✅ Aperturas movidas al Verificador exitosamente');
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
    await moveToVerificador();
    console.log('');
    console.log('🎉 ¡Todas las aperturas están ahora en el Verificador!');
  } catch (error) {
    console.error('❌ Error durante el movimiento:', error.message);
  }
}

main(); 