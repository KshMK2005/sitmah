// Script simple para probar el buscador de operadores
const testBuscador = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('🧪 Probando buscador de operadores...\n');
    
    try {
        // 1. Obtener todos los operadores
        console.log('1. Obteniendo lista de operadores...');
        const response = await fetch(`${API_URL}/operadores`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Operadores cargados: ${data.total}`);
            console.log('📋 Lista de operadores disponibles:');
            data.operadores.forEach(op => {
                console.log(`   - ${op.tarjeton}: ${op.nombre}`);
            });
            
            console.log('\n🎯 Para probar en la interfaz:');
            console.log('   1. Ve a la página de Apertura');
            console.log('   2. En el campo "Operador" verás un buscador');
            console.log('   3. Puedes escribir para buscar por tarjetón o nombre');
            console.log('   4. Selecciona un operador de la lista');
            console.log('   5. Se autocompletará el tarjetón y nombre');
            
        } else {
            console.log('❌ Error al cargar operadores:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
        console.log('\n💡 Asegúrate de que:');
        console.log('   1. El servidor esté corriendo en puerto 5000');
        console.log('   2. Los datos de operadores estén cargados');
        console.log('   3. Ejecuta: node src/database/seedOperadores.js');
    }
};

// Ejecutar la prueba
testBuscador(); 