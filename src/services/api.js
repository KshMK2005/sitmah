// Usar el mismo dominio que el frontend para evitar CORS
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction
    ? `/api`
    : 'http://localhost:5000/api';

console.log('API_URL configurada:', API_URL);
console.log('Hostname actual:', window.location.hostname);
console.log('¿Es producción?', isProduction);

// Servicio para programaciones
export const programacionService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/programacion`);
        if (!response.ok) {
            throw new Error('Error al obtener las programaciones');
        }
        return await response.json();
    },

    create: async (programacionData) => {
        const response = await fetch(`${API_URL}/programacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(programacionData)
        });
        if (!response.ok) {
            throw new Error('Error al crear la programación');
        }
        return await response.json();
    },

    update: async (id, programacionData) => {
        const response = await fetch(`${API_URL}/programacion/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(programacionData)
        });
        if (!response.ok) {
            throw new Error('Error al actualizar la programación');
        }
        return await response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/programacion/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar la programación');
        }
        return await response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/programacion/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener la programación');
        }
        return await response.json();
    }
};

// Servicio para aperturas
export const aperturaService = {
    async create(aperturaData) {
        const response = await fetch(`${API_URL}/apertura`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aperturaData)
        });
        if (!response.ok) {
            const error = await response.json();
            console.log('❌ Error response from server:', error);
            throw new Error(error.message || error.error || 'Error al crear apertura');
        }
        return response.json();
    },
    async getAll() {
        const response = await fetch(`${API_URL}/apertura`);
        if (!response.ok) {
            throw new Error('Error al obtener aperturas');
        }
        return response.json();
    },
    async update(id, data) {
        console.log('📤 Actualizando apertura ID:', id);
        console.log('📤 Datos enviados:', JSON.stringify(data, null, 2));

        const response = await fetch(`${API_URL}/apertura/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        console.log('📡 Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor (texto):', errorText);

            try {
                const errorJson = JSON.parse(errorText);
                console.error('❌ Error del servidor (JSON):', errorJson);
                throw new Error(errorJson.error || errorJson.message || 'Error al actualizar apertura');
            } catch (parseError) {
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
        }

        const result = await response.json();
        console.log('✅ Respuesta exitosa:', result);
        return result;
    },

    async verificarRetrasos() {
        const response = await fetch(`${API_URL}/apertura/verificar-retrasos`);
        if (!response.ok) {
            throw new Error('Error al verificar retrasos');
        }
        return response.json();
    },

    async getByEstado(estado) {
        const response = await fetch(`${API_URL}/apertura/estado/${estado}`);
        if (!response.ok) {
            throw new Error('Error al obtener aperturas por estado');
        }
        return response.json();
    },

    async delete(id) {
        const response = await fetch(`${API_URL}/apertura/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar apertura');
        }
        return response.json();
    },

    async deleteByDate(fecha) {
        const response = await fetch(`${API_URL}/apertura/deleteByDate`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha })
        });
        if (!response.ok) {
            throw new Error('Error al eliminar aperturas por fecha');
        }
        return response.json();
    }
};

// Servicio para usuarios
export const usuarioService = {
    // Registrar usuario
    async register({ usuario, password, rol, tarjeton, correo }) {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password, rol, tarjeton, correo })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar usuario');
        }
        return response.json();
    },
    // Buscar usuario por nombre
    async getByUsuario(usuario) {
        try {
            console.log('🔍 Buscando usuario:', usuario);
            console.log('🌐 URL de la petición:', `${API_URL}/usuarios/${usuario}`);

            const response = await fetch(`${API_URL}/usuarios/${usuario}`);

            console.log('📡 Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('❌ Usuario no encontrado');
                    return null;
                }

                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const userData = await response.json();
            console.log('✅ Usuario encontrado:', userData);
            return userData;
        } catch (error) {
            console.error('❌ Error en getByUsuario:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión: No se pudo conectar con el servidor');
            }

            throw error;
        }
    },
    // Buscar usuario por tarjetón
    async getByTarjeton(tarjeton) {
        const response = await fetch(`${API_URL}/usuarios/tarjeton/${tarjeton}`);
        if (!response.ok) {
            return null;
        }
        return response.json();
    },
    // Actualizar usuario
    async update(usuario, data) {
        const response = await fetch(`${API_URL}/usuarios/${usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar usuario');
        }
        return response.json();
    },
    // Actualizar tema del usuario
    async updateTema(usuario, tema) {
        const response = await fetch(`${API_URL}/usuarios/${usuario}/tema`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar tema del usuario');
        }
        return response.json();
    }
};

// Servicio para configuración global
export const configuracionService = {
    // Obtener configuración por nombre
    async getByNombre(nombre) {
        try {
            const response = await fetch(`${API_URL}/configuracion/${nombre}`);
            if (!response.ok) {
                console.warn(`Configuración ${nombre} no encontrada, usando valor por defecto`);
                return null;
            }
            return response.json();
        } catch (error) {
            console.warn(`Error al obtener configuración ${nombre}:`, error.message);
            return null;
        }
    },

    // Obtener todas las configuraciones
    async getAll() {
        const response = await fetch(`${API_URL}/configuracion`);
        if (!response.ok) {
            throw new Error('Error al obtener configuraciones');
        }
        return response.json();
    },

    // Crear o actualizar configuración
    async save(nombre, valor, descripcion = '') {
        const response = await fetch(`${API_URL}/configuracion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, valor, descripcion })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar configuración');
        }
        return response.json();
    },

    // Actualizar configuración específica
    async update(nombre, valor, descripcion = '') {
        const response = await fetch(`${API_URL}/configuracion/${nombre}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor, descripcion })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar configuración');
        }
        return response.json();
    },

    // Inicializar configuración por defecto
    async init() {
        const response = await fetch(`${API_URL}/configuracion/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al inicializar configuración');
        }
        return response.json();
    }
};