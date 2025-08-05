// Script de prueba para verificar la conectividad del servidor
const testServerConnection = async () => {
    const baseURL = 'http://localhost:5000';
    
    console.log('🧪 Probando conectividad del servidor...');
    console.log('URL base:', baseURL);
    
    try {
        // Probar endpoint básico
        console.log('\n1️⃣ Probando endpoint básico...');
        const response = await fetch(`${baseURL}/`);
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Respuesta:', data);
        
        // Probar endpoint de usuarios
        console.log('\n2️⃣ Probando endpoint de usuarios...');
        const userResponse = await fetch(`${baseURL}/api/usuarios/admin`);
        console.log('Status:', userResponse.status);
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('Usuario encontrado:', userData);
        } else {
            const errorData = await userResponse.json();
            console.log('Error:', errorData);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n💡 Posibles soluciones:');
        console.log('1. Asegúrate de que el servidor esté corriendo en puerto 5000');
        console.log('2. Ejecuta: npm run dev:full');
        console.log('3. Verifica que MongoDB esté conectado');
    }
};

testServerConnection(); 