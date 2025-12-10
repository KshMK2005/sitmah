const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testFrontend() {
    console.log('🧪 Simulando carga de datos del frontend...\n');

    try {
        // 1. Cargar programaciones
        console.log('📊 1. Cargando programaciones...');
        const programaciones = await makeRequest('/api/programacion');
        console.log(`✅ Programaciones cargadas: ${programaciones.length || 0}`);
        
        // Extraer rutas únicas
        const rutasUnicas = Array.from(new Set((programaciones || []).map(p => p.ruta)));
        console.log(`🛣️ Rutas únicas: ${rutasUnicas.join(', ')}`);

        // 2. Cargar operadores
        console.log('\n👥 2. Cargando operadores...');
        const operadores = await makeRequest('/api/operadors');
        console.log(`✅ Operadores cargados: ${operadores.operadores?.length || 0}`);

        // 3. Simular búsqueda de tarjetón
        console.log('\n🔍 3. Simulando búsqueda de tarjetón...');
        const tarjeton = 'TPA0001';
        const operadorEncontrado = operadores.operadores?.find(op => 
            String(op.tarjeton).toLowerCase() === String(tarjeton).toLowerCase()
        );
        
        if (operadorEncontrado) {
            console.log(`✅ Tarjetón ${tarjeton} encontrado: ${operadorEncontrado.nombre}`);
        } else {
            console.log(`❌ Tarjetón ${tarjeton} no encontrado`);
        }

        console.log('\n🎉 Prueba completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testFrontend(); 