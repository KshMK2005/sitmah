// Script simple para probar la funcionalidad del frontend
// Simular datos de operadores (como si vinieran de la base de datos)
const operadoresMock = [
    { id: 1, tarjeton: 'TPA0001', nombre: 'Juan Carlos Pérez López' },
    { id: 2, tarjeton: 'TPA0002', nombre: 'María Elena Rodríguez García' },
    { id: 3, tarjeton: 'TPA0003', nombre: 'Roberto Antonio Silva Mendoza' },
    { id: 4, tarjeton: 'TPA0004', nombre: 'Ana Patricia Morales Torres' },
    { id: 5, tarjeton: 'TPA0005', nombre: 'Carlos Alberto Herrera Jiménez' }
];

// Función para simular la búsqueda de operador por tarjetón
function buscarOperadorPorTarjeton(tarjeton) {
    console.log(`🔍 Buscando operador con tarjetón: ${tarjeton}`);
    
    const operador = operadoresMock.find(op => op.tarjeton === tarjeton);
    
    if (operador) {
        console.log(`✅ Operador encontrado: ${operador.nombre}`);
        return operador;
    } else {
        console.log(`❌ No se encontró operador con tarjetón: ${tarjeton}`);
        return null;
    }
}

// Función para simular el useEffect del React
function simularUseEffect(tarjeton) {
    console.log(`\n🔄 Simulando useEffect con tarjetón: "${tarjeton}"`);
    
    if (tarjeton && tarjeton.trim() !== '') {
        const operador = buscarOperadorPorTarjeton(tarjeton.trim());
        if (operador && operador.nombre) {
            console.log(`✅ Estableciendo nombre: ${operador.nombre}`);
            return operador.nombre;
        } else {
            console.log('❌ Operador sin nombre, limpiando campo');
            return '';
        }
    } else {
        console.log('🔍 Tarjetón vacío, limpiando nombre');
        return '';
    }
}

// Pruebas
console.log('🧪 PRUEBAS DE FUNCIONALIDAD DEL FRONTEND\n');

// Prueba 1: Tarjetón válido
console.log('=== PRUEBA 1: Tarjetón válido ===');
const nombre1 = simularUseEffect('TPA0001');
console.log(`Resultado: "${nombre1}"`);

// Prueba 2: Tarjetón válido con espacios
console.log('\n=== PRUEBA 2: Tarjetón válido con espacios ===');
const nombre2 = simularUseEffect('  TPA0002  ');
console.log(`Resultado: "${nombre2}"`);

// Prueba 3: Tarjetón inexistente
console.log('\n=== PRUEBA 3: Tarjetón inexistente ===');
const nombre3 = simularUseEffect('INEXISTENTE');
console.log(`Resultado: "${nombre3}"`);

// Prueba 4: Tarjetón vacío
console.log('\n=== PRUEBA 4: Tarjetón vacío ===');
const nombre4 = simularUseEffect('');
console.log(`Resultado: "${nombre4}"`);

// Prueba 5: Tarjetón con solo espacios
console.log('\n=== PRUEBA 5: Tarjetón con solo espacios ===');
const nombre5 = simularUseEffect('   ');
console.log(`Resultado: "${nombre5}"`);

console.log('\n✅ Todas las pruebas completadas'); 