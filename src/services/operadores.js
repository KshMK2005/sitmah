const API_URL = 'http://localhost:5000/api';

export const operadorService = {
    // Buscar operador por tarjetón
    async buscarPorTarjeton(tarjeton) {
        try {
            const response = await fetch(`${API_URL}/operadores/buscar/${tarjeton}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al buscar operador');
            }
            
            return data.operador;
        } catch (error) {
            console.error('Error en buscarPorTarjeton:', error);
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
            const response = await fetch(`${API_URL}/operadores`);
            const data = await response.json();
            
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