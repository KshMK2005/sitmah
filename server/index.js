import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../src/database/config.js';

// SITMAH v1.0.2 - Corrección de despliegue Vercel y configuración automática

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

console.log('Variables de entorno cargadas:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Conectar a la base de datos
console.log('Intentando conectar a la base de datos...');
connectDB().then(async () => {
    console.log('✅ Base de datos conectada');
    
    // Inicializar configuración por defecto si es necesario
    if (process.env.NODE_ENV === 'production') {
        try {
            const Configuracion = (await import('./database/models/Configuracion.js')).default;
            
            // Verificar si existe la configuración temaGlobal
            const temaGlobal = await Configuracion.findOne({ nombre: 'temaGlobal' });
            if (!temaGlobal) {
                console.log('🔧 Inicializando configuración por defecto...');
                
                const configuraciones = [
                    {
                        nombre: 'temaGlobal',
                        valor: 'normal',
                        descripcion: 'Tema global de la aplicación (normal, sanvalentin, navidad, muertos)'
                    },
                    {
                        nombre: 'version',
                        valor: '1.0.0',
                        descripcion: 'Versión actual del sistema'
                    },
                    {
                        nombre: 'mantenimiento',
                        valor: 'false',
                        descripcion: 'Modo mantenimiento del sistema'
                    }
                ];
                
                for (const config of configuraciones) {
                    await Configuracion.findOneAndUpdate(
                        { nombre: config.nombre },
                        config,
                        { upsert: true, new: true }
                    );
                }
                
                console.log('✅ Configuración inicializada correctamente');
            } else {
                console.log('✅ Configuración ya existe');
            }
        } catch (error) {
            console.error('⚠️ Error al inicializar configuración:', error.message);
            // No fallar el servidor por este error
        }
    }
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'API de SITMAH funcionando' });
});

// Importar rutas
import programacionRoutes from './routes/programacionRoutes.js';
import aperturaRoutes from './routes/aperturaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import operadorRoutes from './routes/operadorRoutes.js';
import configuracionRoutes from './routes/configuracionRoutes.js';

// Usar rutas
app.use('/api/programacion', programacionRoutes);
app.use('/api/apertura', aperturaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/operadores', operadorRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
    // Servir archivos estáticos desde la carpeta dist
    app.use(express.static(path.join(__dirname, '../dist'), {
        setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (path.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            } else if (path.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
            }
        }
    }));

    // Manejar todas las rutas de React
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    
    // Evitar exponer detalles internos en producción
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: isProduction ? 'Ha ocurrido un error interno' : err.message,
        timestamp: new Date().toISOString()
    });
});

// Manejador para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

// Manejar errores de inicio del servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}).on('error', (err) => {
    console.error('Error al iniciar el servidor:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso. Intenta con otro puerto.`);
    }
    process.exit(1);
}); 