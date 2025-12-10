const http = require('http');

async function testRutas() {
    console.log('🔍 Probando conexión a rutas...');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/programacion',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ Rutas disponibles:');
                console.log(JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.log('❌ Error al parsear JSON:', error.message);
                console.log('📄 Respuesta raw:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error de conexión:', error.message);
    });

    req.end();
}

testRutas(); 