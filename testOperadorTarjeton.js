// Script de prueba para verificar la funcionalidad de búsqueda de operadores por tarjetón
import { operadorService } from './src/services/operadores.js';

async function testBuscarOperador() {
    console.log('=== Prueba de búsqueda de operador por tarjetón ===');
    
    try {
        // Prueba 1: Obtener todos los operadores
        console.log('\n1. Obteniendo todos los operadores...');
        const operadores = await operadorService.obtenerTodos();
        console.log(`Total de operadores encontrados: ${operadores.length}`);
        
        if (operadores.length > 0) {
            console.log('Primeros 3 operadores:');
            operadores.slice(0, 3).forEach(op => {
                console.log(`- Tarjetón: ${op.tarjeton}, Nombre: ${op.nombre}`);
            });
            
            // Prueba 2: Buscar operador por tarjetón
            const primerOperador = operadores[0];
            console.log(`\n2. Buscando operador con tarjetón: ${primerOperador.tarjeton}`);
            
            const operadorEncontrado = await operadorService.buscarPorTarjeton(primerOperador.tarjeton);
            if (operadorEncontrado) {
                console.log('✅ Operador encontrado:');
                console.log(`   Tarjetón: ${operadorEncontrado.tarjeton}`);
                console.log(`   Nombre: ${operadorEncontrado.nombre}`);
            } else {
                console.log('❌ Operador no encontrado');
            }
            
            // Prueba 3: Buscar con tarjetón inexistente
            console.log('\n3. Probando con tarjetón inexistente: "INEXISTENTE"');
            try {
                const operadorInexistente = await operadorService.buscarPorTarjeton('INEXISTENTE');
                console.log('Resultado:', operadorInexistente);
            } catch (error) {
                console.log('✅ Error esperado:', error.message);
            }
        } else {
            console.log('❌ No hay operadores en la base de datos');
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar la prueba
testBuscarOperador(); 