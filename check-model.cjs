const https = require('https');

console.log('🔍 Verificando configuración del modelo en el servidor...');

const checkModel = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sitmah.vercel.app',
      port: 443,
      path: '/api/apertura/modelo-info',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const modelInfo = JSON.parse(data);
          console.log('📋 Configuración actual del modelo:');
          console.log('');
          console.log('🚌 tipoUnidad enum:', modelInfo.tipoUnidad.enum);
          console.log('📊 estado enum:', modelInfo.estado.enum);
          console.log('');
          
          const hasOrion = modelInfo.tipoUnidad.enum.includes('ORION');
          const hasApertura = modelInfo.estado.enum.includes('apertura');
          
          console.log('✅ ORION en tipoUnidad:', hasOrion ? 'SÍ' : 'NO');
          console.log('✅ apertura en estado:', hasApertura ? 'SÍ' : 'NO');
          
          if (!hasOrion || !hasApertura) {
            console.log('');
            console.log('⚠️ El modelo aún no se ha actualizado completamente');
            console.log('🔄 Es posible que necesites esperar unos minutos más');
          } else {
            console.log('');
            console.log('🎉 ¡El modelo está actualizado correctamente!');
          }
          
          resolve(modelInfo);
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

    req.end();
  });
};

async function main() {
  try {
    await checkModel();
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

main(); 