import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Configuracion from './server/database/models/Configuracion.js';

dotenv.config();

async function initConfig() {
    console.log('🔧 Inicializando configuración por defecto...\n');
    
    try {
        // Conectar a MongoDB
        console.log('1️⃣ Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB');
        
        // Configuraciones por defecto
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
        
        console.log('2️⃣ Verificando configuraciones existentes...');
        
        for (const config of configuraciones) {
            const existe = await Configuracion.findOne({ nombre: config.nombre });
            
            if (!existe) {
                console.log(`   ➕ Creando configuración: ${config.nombre}`);
                await Configuracion.create(config);
            } else {
                console.log(`   ✅ Configuración ya existe: ${config.nombre}`);
            }
        }
        
        console.log('\n3️⃣ Verificando configuraciones...');
        const todas = await Configuracion.find();
        console.log(`   📋 Total de configuraciones: ${todas.length}`);
        
        todas.forEach(config => {
            console.log(`   - ${config.nombre}: ${config.valor}`);
        });
        
        console.log('\n🎉 Configuración inicializada exitosamente!');
        
    } catch (error) {
        console.error('\n❌ Error durante la inicialización:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Conexión a MongoDB cerrada');
    }
}

// Ejecutar inicialización
initConfig(); 