const http = require('http');

async function testServer() {
    console.log('🔍 Probando conexión al servidor...');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/operadors',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📡 Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ Respuesta del servidor:');
                console.log(JSON.stringify(jsonData, null, 2));
            } catch (error) {
                console.log('❌ Error al parsear JSON:', error.message);
                console.log('📄 Respuesta raw:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error de conexión:', error.message);
        console.log('💡 Asegúrate de que el servidor esté corriendo en puerto 5000');
    });

    req.end();
}

testServer(); 