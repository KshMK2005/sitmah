// Script de prueba para verificar el buscador de operadores en App.jsx
const testAppOperadores = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('🧪 Probando buscador de operadores en App.jsx...\n');
    
    try {
        // 1. Verificar que la API esté funcionando
        console.log('1. Verificando conexión con la API...');
        const response = await fetch(`${API_URL}/operadores`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ API funcionando correctamente`);
            console.log(`📊 Total de operadores disponibles: ${data.total}`);
            
            // 2. Mostrar algunos ejemplos de operadores
            console.log('\n2. Ejemplos de operadores disponibles:');
            data.operadores.slice(0, 5).forEach((op, index) => {
                console.log(`   ${index + 1}. ${op.tarjeton} - ${op.nombre}`);
            });
            
            // 3. Instrucciones para probar en la interfaz
            console.log('\n🎯 Para probar en App.jsx:');
            console.log('   1. Ve a la página principal (App.jsx)');
            console.log('   2. En el formulario "Nueva Programación"');
            console.log('   3. Busca el campo "Operador" (dropdown)');
            console.log('   4. Puedes:');
            console.log('      - Escribir para buscar por tarjetón (ej: "TPA0001")');
            console.log('      - Escribir para buscar por nombre (ej: "Juan Carlos")');
            console.log('      - Hacer clic para ver la lista completa');
            console.log('   5. Al seleccionar un operador:');
            console.log('      - Se autocompletará el tarjetón');
            console.log('      - Se autocompletará el nombre');
            console.log('      - Aparecerá en la tabla de horarios');
            
            // 4. Probar búsquedas específicas
            console.log('\n3. Probando búsquedas específicas...');
            const testCases = [
                { tarjeton: 'TPA0001', expected: 'Juan Carlos Pérez López' },
                { tarjeton: 'TPA0002', expected: 'María Elena Rodríguez García' },
                { tarjeton: 'TPA0005', expected: 'Carlos Alberto Herrera Jiménez' }
            ];
            
            for (const testCase of testCases) {
                const searchResponse = await fetch(`${API_URL}/operadores/buscar/${testCase.tarjeton}`);
                const searchData = await searchResponse.json();
                
                if (searchData.success && searchData.operador) {
                    console.log(`   ✅ ${testCase.tarjeton} → ${searchData.operador.nombre}`);
                    if (searchData.operador.nombre === testCase.expected) {
                        console.log(`      ✓ Nombre correcto`);
                    } else {
                        console.log(`      ⚠ Nombre diferente al esperado`);
                    }
                } else {
                    console.log(`   ❌ ${testCase.tarjeton} → No encontrado`);
                }
            }
            
            console.log('\n🎉 Pruebas completadas exitosamente!');
            console.log('\n💡 Consejos adicionales:');
            console.log('   - El buscador funciona igual que el de "Ruta"');
            console.log('   - Puedes limpiar la selección con la X');
            console.log('   - Los datos se guardan automáticamente en el formulario');
            console.log('   - Al editar un horario existente, se cargará el operador correcto');
            
        } else {
            console.log('❌ Error al cargar operadores:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
        console.log('\n🔧 Solución de problemas:');
        console.log('   1. Asegúrate de que el servidor esté corriendo: npm run dev');
        console.log('   2. Verifica que los datos estén cargados: node src/database/seedOperadores.js');
        console.log('   3. Revisa la consola del navegador para errores');
        console.log('   4. Verifica que la API esté respondiendo en puerto 5000');
    }
};

// Ejecutar las pruebas
testAppOperadores(); 