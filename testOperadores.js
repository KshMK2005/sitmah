const https = require('https');
const http = require('http');

// Función fetch simple para Node.js
function fetch(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    json: () => JSON.parse(data)
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Script de prueba para verificar la funcionalidad de búsqueda de operadores
const testOperadores = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('🧪 Iniciando pruebas de operadores...\n');
    
    try {
        // 1. Verificar estado de la base de datos
        console.log('1. Verificando estado de la base de datos...');
        const statusResponse = await fetch(`${API_URL}/operadores/status`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
            console.log('✅ Base de datos conectada');
            console.log(`📊 Total de operadores: ${statusData.totalOperadores}`);
            console.log('📋 Ejemplos de operadores:');
            statusData.sampleOperadores.forEach(op => {
                console.log(`   - ${op.tarjeton}: ${op.nombre}`);
            });
        } else {
            console.log('❌ Error al verificar estado:', statusData.message);
            return;
        }
        
        console.log('\n2. Probando búsquedas de operadores...\n');
        
        // 2. Probar búsquedas exitosas
        const tarjetonesExitosos = ['TPA0001', 'TPA0005', 'TPA0010'];
        
        for (const tarjeton of tarjetonesExitosos) {
            console.log(`Buscando tarjetón: ${tarjeton}`);
            const response = await fetch(`${API_URL}/operadores/buscar/${tarjeton}`);
            const data = await response.json();
            
            if (data.success && data.operador) {
                console.log(`✅ Encontrado: ${data.operador.nombre}`);
            } else {
                console.log(`❌ No encontrado: ${data.message}`);
            }
        }
        
        // 3. Probar búsquedas que no existen
        console.log('\n3. Probando búsquedas inexistentes...\n');
        
        const tarjetonesInexistentes = ['TPA9999', 'INVALIDO', 'ABC123'];
        
        for (const tarjeton of tarjetonesInexistentes) {
            console.log(`Buscando tarjetón inexistente: ${tarjeton}`);
            const response = await fetch(`${API_URL}/operadores/buscar/${tarjeton}`);
            const data = await response.json();
            
            if (response.status === 404) {
                console.log(`✅ Correcto: No encontrado (404)`);
            } else {
                console.log(`❌ Error: ${data.message}`);
            }
        }
        
        // 4. Probar búsqueda con espacios y variaciones
        console.log('\n4. Probando búsquedas con variaciones...\n');
        
        const variaciones = [
            ' tpa0001 ',  // Con espacios
            'tpa0001',    // Minúsculas
            'TPA0001',    // Mayúsculas
            '  TPA0001  ' // Múltiples espacios
        ];
        
        for (const tarjeton of variaciones) {
            console.log(`Buscando variación: "${tarjeton}"`);
            const response = await fetch(`${API_URL}/operadores/buscar/${tarjeton}`);
            const data = await response.json();
            
            if (data.success && data.operador) {
                console.log(`✅ Encontrado: ${data.operador.nombre}`);
            } else {
                console.log(`❌ No encontrado: ${data.message}`);
            }
        }
        
        console.log('\n🎉 Todas las pruebas completadas!');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
        console.log('\n💡 Asegúrate de que:');
        console.log('   1. El servidor esté corriendo en puerto 5000');
        console.log('   2. La base de datos esté conectada');
        console.log('   3. Los datos de operadores estén cargados');
    }
};

// Ejecutar las pruebas
testOperadores();

// Verificar el campo tarjetón
const tarjetonInput = document.querySelector('input[data-testid="tarjeton-input"]');
console.log('Campo tarjetón por data-testid:', tarjetonInput);
if (tarjetonInput) {
    console.log('Name attribute:', tarjetonInput.getAttribute('name'));
    console.log('Name property:', tarjetonInput.name);
} 