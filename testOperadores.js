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

const API_URL = 'http://localhost:5000/api';

async function testOperadores() {
    try {
        console.log('Probando API de operadores...\n');

        // Test 1: Buscar operador por tarjetón existente
        console.log('1. Probando búsqueda por tarjetón TPA0001...');
        const response1 = await fetch(`${API_URL}/operadores/buscar/TPA0001`);
        const data1 = await response1.json();
        
        if (response1.ok) {
            console.log('✅ Operador encontrado:', data1.operador);
        } else {
            console.log('❌ Error:', data1.message);
        }

        // Test 2: Buscar operador por tarjetón inexistente
        console.log('\n2. Probando búsqueda por tarjetón inexistente...');
        const response2 = await fetch(`${API_URL}/operadores/buscar/INEXISTENTE`);
        const data2 = await response2.json();
        
        if (response2.status === 404) {
            console.log('✅ Correcto: Operador no encontrado');
        } else {
            console.log('❌ Error inesperado:', data2);
        }

        // Test 3: Buscar operadores por nombre
        console.log('\n3. Probando búsqueda por nombre "JESÚS"...');
        const response3 = await fetch(`${API_URL}/operadores/buscar-nombre/JESÚS`);
        const data3 = await response3.json();
        
        if (response3.ok) {
            console.log(`✅ Encontrados ${data3.operadores.length} operadores:`);
            data3.operadores.slice(0, 3).forEach(op => {
                console.log(`   - ${op.nombre} (${op.tarjeton})`);
            });
        } else {
            console.log('❌ Error:', data3.message);
        }

        // Test 4: Obtener todos los operadores
        console.log('\n4. Probando obtener todos los operadores...');
        const response4 = await fetch(`${API_URL}/operadores`);
        const data4 = await response4.json();
        
        if (response4.ok) {
            console.log(`✅ Total de operadores: ${data4.total}`);
        } else {
            console.log('❌ Error:', data4.message);
        }

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

// Ejecutar las pruebas
testOperadores(); 

// Verificar el campo tarjetón
const tarjetonInput = document.querySelector('input[data-testid="tarjeton-input"]');
console.log('Campo tarjetón por data-testid:', tarjetonInput);
if (tarjetonInput) {
    console.log('Name attribute:', tarjetonInput.getAttribute('name'));
    console.log('Name property:', tarjetonInput.name);
} 