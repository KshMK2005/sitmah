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
const API_URL = 'http://localhost:5000/api';

async function testBuscarOperador() {
    console.log('🧪 Probando búsqueda de operadores...\n');
    
    try {
        // 1. Obtener todos los operadores para ver qué hay en la base de datos
        console.log('1️⃣ Obteniendo todos los operadores...');
        const response = await fetch(`${API_URL}/operadores`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Encontrados ${data.operadores.length} operadores`);
            if (data.operadores.length > 0) {
                console.log('📋 Primeros 3 operadores:');
                data.operadores.slice(0, 3).forEach((op, index) => {
                    console.log(`   ${index + 1}. Tarjetón: "${op.tarjeton}" | Nombre: "${op.nombre}"`);
                });
                
                // 2. Probar búsqueda con el primer tarjetón
                const primerTarjeton = data.operadores[0].tarjeton;
                console.log(`\n2️⃣ Probando búsqueda con tarjetón: "${primerTarjeton}"`);
                
                const searchResponse = await fetch(`${API_URL}/operadores/buscar/${primerTarjeton}`);
                const searchData = await searchResponse.json();
                
                if (searchData.success) {
                    console.log(`✅ Operador encontrado: ${searchData.operador.nombre}`);
                } else {
                    console.log(`❌ Error: ${searchData.message}`);
                }
                
                // 3. Probar búsqueda con un tarjetón que no existe
                console.log('\n3️⃣ Probando búsqueda con tarjetón inexistente: "INEXISTENTE"');
                const notFoundResponse = await fetch(`${API_URL}/operadores/buscar/INEXISTENTE`);
                const notFoundData = await notFoundResponse.json();
                
                if (notFoundResponse.status === 404) {
                    console.log('✅ Correcto: Tarjetón no encontrado (404)');
                } else {
                    console.log(`❌ Error inesperado: ${notFoundResponse.status}`);
                }
                
            } else {
                console.log('⚠️ No hay operadores en la base de datos');
            }
        } else {
            console.log('❌ Error al obtener operadores:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:5000');
    }
}

// Ejecutar la prueba
testBuscarOperador();

// Verificar el campo tarjetón
const tarjetonInput = document.querySelector('input[data-testid="tarjeton-input"]');
console.log('Campo tarjetón por data-testid:', tarjetonInput);
if (tarjetonInput) {
    console.log('Name attribute:', tarjetonInput.getAttribute('name'));
    console.log('Name property:', tarjetonInput.name);
} 