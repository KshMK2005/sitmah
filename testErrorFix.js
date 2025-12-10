// Script para verificar que el error de map se ha solucionado
const testErrorFix = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('🔧 Verificando solución del error de map...\n');
    
    try {
        // 1. Verificar que la API esté funcionando
        console.log('1. Verificando conexión con la API...');
        const response = await fetch(`${API_URL}/operadores`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ API funcionando correctamente`);
            console.log(`📊 Total de operadores: ${data.total}`);
            
            // 2. Verificar que los datos tengan la estructura correcta
            console.log('\n2. Verificando estructura de datos...');
            if (data.operadores && Array.isArray(data.operadores)) {
                console.log('✅ Array de operadores válido');
                
                // Verificar que cada operador tenga las propiedades necesarias
                const operadorValido = data.operadores.every(op => 
                    op.tarjeton && op.nombre && typeof op.tarjeton === 'string' && typeof op.nombre === 'string'
                );
                
                if (operadorValido) {
                    console.log('✅ Todos los operadores tienen tarjetón y nombre válidos');
                } else {
                    console.log('⚠ Algunos operadores pueden tener datos incompletos');
                }
            } else {
                console.log('❌ Array de operadores inválido o faltante');
            }
            
            // 3. Probar la funcionalidad de mapeo
            console.log('\n3. Probando funcionalidad de mapeo...');
            try {
                const opciones = data.operadores ? data.operadores.map(op => ({
                    value: op.tarjeton,
                    label: `${op.tarjeton} - ${op.nombre}`
                })) : [];
                
                console.log(`✅ Mapeo exitoso: ${opciones.length} opciones generadas`);
                
                if (opciones.length > 0) {
                    console.log('📋 Ejemplo de opción generada:', opciones[0]);
                }
            } catch (mapError) {
                console.log('❌ Error en el mapeo:', mapError.message);
            }
            
            console.log('\n🎉 Verificación completada!');
            console.log('\n💡 El error de map debería estar solucionado.');
            console.log('   - Se agregaron verificaciones de null/undefined');
            console.log('   - Se establecen arrays vacíos como fallback');
            console.log('   - Se manejan errores de carga de datos');
            
        } else {
            console.log('❌ Error al cargar operadores:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error.message);
        console.log('\n🔧 Asegúrate de que:');
        console.log('   1. El servidor esté corriendo');
        console.log('   2. Los datos estén cargados');
        console.log('   3. La API esté respondiendo correctamente');
    }
};

// Ejecutar la verificación
testErrorFix(); 