const https = require('https');

console.log('🔄 Agregando estado en_verificacion al modelo...');

const addEnVerificacion = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      nuevoEstado: 'en_verificacion'
    });
    
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura/agregar-estado',
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
          console.log('✅ Estado en_verificacion agregado exitosamente');
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
    await addEnVerificacion();
    console.log('');
    console.log('🎉 ¡Estado en_verificacion agregado al modelo!');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error.message);
  }
}

main(); 