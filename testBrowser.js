// Script para probar desde la consola del navegador
// Copia y pega este código en la consola del navegador (F12)

console.log('=== PRUEBA DE API DE OPERADORES ===');

// Función de prueba
async function testOperadoresAPI() {
    try {
        console.log('1. Probando conexión a la API...');
        
        // Test 1: Obtener todos los operadores
        const response1 = await fetch('http://localhost:5000/api/operadores');
        console.log('Status:', response1.status);
        console.log('OK:', response1.ok);
        
        if (response1.ok) {
            const data1 = await response1.json();
            console.log('✅ Total de operadores:', data1.total);
            console.log('Primeros 3 operadores:', data1.operadores.slice(0, 3));
        } else {
            console.log('❌ Error al obtener operadores');
        }

        // Test 2: Buscar operador específico
        console.log('\n2. Probando búsqueda por tarjetón TPA0001...');
        const response2 = await fetch('http://localhost:5000/api/operadores/buscar/TPA0001');
        console.log('Status:', response2.status);
        console.log('OK:', response2.ok);
        
        if (response2.ok) {
            const data2 = await response2.json();
            console.log('✅ Operador encontrado:', data2.operador);
        } else {
            const errorData = await response2.json();
            console.log('❌ Error:', errorData);
        }

        // Test 3: Buscar operador inexistente
        console.log('\n3. Probando búsqueda por tarjetón inexistente...');
        const response3 = await fetch('http://localhost:5000/api/operadores/buscar/INEXISTENTE');
        console.log('Status:', response3.status);
        
        if (response3.status === 404) {
            console.log('✅ Correcto: Operador no encontrado');
        } else {
            console.log('❌ Error inesperado');
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar la prueba
testOperadoresAPI();

// También puedes probar manualmente:
// fetch('http://localhost:5000/api/operadores/buscar/TPA0001').then(r => r.json()).then(console.log) 