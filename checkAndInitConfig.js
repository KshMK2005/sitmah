import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    console.log('URI de conexión:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    console.log('📊 Base de datos:', conn.connection.name);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    return false;
  }
};

// Esquema de configuración
const configuracionSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  valor: { type: String, required: true },
  descripcion: { type: String },
  fechaActualizacion: { type: Date, default: Date.now }
});

const Configuracion = mongoose.model('Configuracion', configuracionSchema);

// Función para verificar y crear configuración
const checkAndInitConfig = async () => {
  try {
    console.log('\n🔍 Verificando configuración existente...');
    
    // Verificar si existe la configuración del tema
    const temaExistente = await Configuracion.findOne({ nombre: 'temaGlobal' });
    
    if (temaExistente) {
      console.log('✅ Configuración del tema encontrada:');
      console.log(`   - Nombre: ${temaExistente.nombre}`);
      console.log(`   - Valor: ${temaExistente.valor}`);
      console.log(`   - Descripción: ${temaExistente.descripcion}`);
      console.log(`   - Última actualización: ${temaExistente.fechaActualizacion}`);
    } else {
      console.log('❌ Configuración del tema no encontrada');
      console.log('🔄 Creando configuración inicial...');
      
      // Crear configuración inicial del tema
      const nuevaConfig = await Configuracion.create({
        nombre: 'temaGlobal',
        valor: 'normal',
        descripcion: 'Tema global de la aplicación'
      });
      
      console.log('✅ Configuración del tema creada exitosamente:');
      console.log(`   - Nombre: ${nuevaConfig.nombre}`);
      console.log(`   - Valor: ${nuevaConfig.valor}`);
      console.log(`   - Descripción: ${nuevaConfig.descripcion}`);
    }

    // Listar todas las configuraciones
    console.log('\n📋 Todas las configuraciones en la base de datos:');
    const todasConfigs = await Configuracion.find();
    if (todasConfigs.length === 0) {
      console.log('   No hay configuraciones en la base de datos');
    } else {
      todasConfigs.forEach((config, index) => {
        console.log(`   ${index + 1}. ${config.nombre}: ${config.valor}`);
      });
    }

    console.log('\n✅ Verificación completada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return false;
  }
};

// Función para probar la API
const testAPI = async () => {
  try {
    console.log('\n🧪 Probando API de configuración...');
    
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://tu-app.vercel.app/api' 
      : 'http://localhost:5000/api';
    
    console.log(`🌐 URL base: ${baseURL}`);
    
    // Probar obtener configuración
    const response = await fetch(`${baseURL}/configuracion/temaGlobal`);
    if (response.ok) {
      const config = await response.json();
      console.log('✅ API funcionando correctamente:');
      console.log(`   - Tema actual: ${config.valor}`);
    } else {
      console.log('❌ Error en la API:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error probando API:', error.message);
  }
};

// Ejecutar el script
const main = async () => {
  console.log('🚀 Iniciando verificación de configuración en MongoDB Atlas...\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ No se pudo conectar a MongoDB Atlas');
    process.exit(1);
  }
  
  const success = await checkAndInitConfig();
  if (success) {
    await testAPI();
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Script completado');
};

main().catch(console.error); 