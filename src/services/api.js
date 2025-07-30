// Detectar si estamos en producción (Vercel)
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction 
  ? 'https://sitmah.vercel.app/api' 
  : 'http://localhost:5000/api';

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
            throw new Error(error.error || 'Error al crear apertura');
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
        const response = await fetch(`${API_URL}/apertura/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar apertura');
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
        const response = await fetch(`${API_URL}/usuarios/${usuario}`);
        if (!response.ok) {
            return null;
        }
        return response.json();
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
    }
};