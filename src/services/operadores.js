// Usar el mismo dominio que el frontend para evitar CORS
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction 
  ? `/api` 
  : 'http://localhost:5000/api';

console.log('API_URL configurado como:', API_URL);

export const operadorService = {
    // Buscar operador por tarjetón
    async buscarPorTarjeton(tarjeton) {
        try {
            // Normalizar: mayúsculas y sin espacios
            const tarjetonNormalizado = String(tarjeton).trim().toUpperCase().replace(/\s+/g, '');
            console.log('Iniciando búsqueda de operador con tarjetón:', tarjetonNormalizado);
            console.log('URL de la petición:', `${API_URL}/operadores/buscar/${tarjetonNormalizado}`);
            
            const response = await fetch(`${API_URL}/operadores/buscar/${tarjetonNormalizado}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Agregar timeout para evitar esperas indefinidas
                signal: AbortSignal.timeout(5000) // 5 segundos de timeout
            });
            
            console.log('Respuesta recibida:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            // Compatibilidad: aceptar data.operador o data directamente
            let operador = data.operador || data;
            if (!operador || !operador.nombre) {
                throw new Error(data?.message || 'No se encontró el operador');
            }
            
            return operador;
        } catch (error) {
            console.error('Error en buscarPorTarjeton:', error);
            // Si es un error de timeout o red, lanzar un error más específico
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La búsqueda tardó demasiado');
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión: No se pudo conectar con el servidor');
            }
            throw error;
        }
    },

    // Buscar operadores por nombre (búsqueda parcial)
    async buscarPorNombre(nombre) {
        try {
            const response = await fetch(`${API_URL}/operadores/buscar-nombre/${nombre}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al buscar operadores');
            }
            
            return data.operadores;
        } catch (error) {
            console.error('Error en buscarPorNombre:', error);
            throw error;
        }
    },

    // Obtener todos los operadores (para debugging)
    async obtenerTodos() {
        try {
            console.log('Obteniendo todos los operadores...');
            console.log('URL de la petición:', `${API_URL}/operadores`);
            
            const response = await fetch(`${API_URL}/operadores`);
            console.log('Respuesta recibida:', response.status, response.statusText);
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener operadores');
            }
            
            return data.operadores;
        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            throw error;
        }
    }
};