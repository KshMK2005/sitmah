import fetch from 'node-fetch';

const testAPI = async () => {
    try {
        console.log('Probando API de operadores...');
        
        // Probar obtener todos los operadores
        const response = await fetch('http://localhost:5000/api/operadores');
        const data = await response.json();
        
        console.log('Respuesta de la API:', data);
        
        if (data.success) {
            console.log(`✅ API funcionando correctamente. ${data.total} operadores encontrados.`);
            
            // Probar búsqueda específica
            const searchResponse = await fetch('http://localhost:5000/api/operadores/buscar/TPA0001');
            const searchData = await searchResponse.json();
            
            console.log('Búsqueda de TPA0001:', searchData);
        } else {
            console.log('❌ Error en la API:', data);
        }
        
    } catch (error) {
        console.error('❌ Error al conectar con la API:', error.message);
    }
};

testAPI(); 