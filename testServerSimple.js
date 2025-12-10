// Script simple para probar si el servidor está funcionando
import fetch from 'node-fetch';

async function testServer() {
    console.log('🔍 Probando conexión al servidor...');
    
    try {
        // Probar la ruta raíz primero
        console.log('\n1. Probando ruta raíz...');
        const response1 = await fetch('http://localhost:5000/');
        console.log('Status raíz:', response1.status);
        
        // Probar la ruta de operadores
        console.log('\n2. Probando ruta de operadores...');
        const response2 = await fetch('http://localhost:5000/api/operadores');
        console.log('Status operadores:', response2.status);
        console.log('OK:', response2.ok);
        
        if (response2.ok) {
            const data = await response2.json();
            console.log('✅ Datos recibidos:', data);
        } else {
            const text = await response2.text();
            console.log('❌ Respuesta del servidor:', text.substring(0, 200));
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testServer(); 