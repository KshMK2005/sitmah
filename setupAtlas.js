import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando MongoDB Atlas para el sistema de temas...\n');

// Función para crear archivo .env si no existe
const createEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# Configuración del servidor
PORT=5000
NODE_ENV=development

# Base de datos MongoDB Atlas
# Reemplaza esta URL con tu cadena de conexión real de MongoDB Atlas
MONGODB_URI=mongodb+srv://sitmah_user:tu_contraseña@cluster.mongodb.net/sitmah?retryWrites=true&w=majority

# En producción, Vercel proporcionará MONGODB_URI automáticamente
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado');
    console.log('📝 Por favor, edita el archivo .env y reemplaza la URL de MongoDB Atlas con tu cadena de conexión real');
  } else {
    console.log('✅ Archivo .env ya existe');
  }
};

// Función para verificar la conexión a MongoDB Atlas
const testAtlasConnection = async (uri) => {
  try {
    console.log('🔗 Probando conexión a MongoDB Atlas...');
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ Conectado exitosamente a: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Solución: Verifica que la cadena de conexión sea correcta');
      console.log('   Asegúrate de reemplazar "tu_contraseña" con tu contraseña real');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Solución: Verifica tu conexión a internet');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Solución: Verifica el username y password');
    } else if (error.message.includes('Network access denied')) {
      console.log('\n💡 Solución: Ve a "Network Access" en Atlas y agrega tu IP');
    }
    
    return false;
  }
};

// Función para configurar el sistema de temas en Atlas
const setupThemeSystem = async (uri) => {
  try {
    console.log('\n🎨 Configurando sistema de temas en MongoDB Atlas...');
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Esquema de configuración
    const configuracionSchema = new mongoose.Schema({
      nombre: { type: String, required: true, unique: true },
      valor: { type: String, required: true },
      descripcion: { type: String },
      fechaActualizacion: { type: Date, default: Date.now }
    });
    
    const Configuracion = mongoose.model('Configuracion', configuracionSchema);
    
    // Verificar si ya existe la configuración del tema
    const temaExistente = await Configuracion.findOne({ nombre: 'temaGlobal' });
    
    if (temaExistente) {
      console.log('✅ Configuración del tema ya existe en Atlas:');
      console.log(`   - Tema actual: ${temaExistente.valor}`);
      console.log(`   - Última actualización: ${temaExistente.fechaActualizacion}`);
    } else {
      console.log('🔄 Creando configuración del tema en Atlas...');
      
      const nuevaConfig = await Configuracion.create({
        nombre: 'temaGlobal',
        valor: 'normal',
        descripcion: 'Tema global de la aplicación'
      });
      
      console.log('✅ Configuración del tema creada en Atlas:');
      console.log(`   - Tema: ${nuevaConfig.valor}`);
      console.log(`   - Descripción: ${nuevaConfig.descripcion}`);
    }
    
    // Listar todas las configuraciones
    const todasConfigs = await Configuracion.find();
    console.log('\n📋 Configuraciones en Atlas:');
    if (todasConfigs.length === 0) {
      console.log('   No hay configuraciones');
    } else {
      todasConfigs.forEach((config, index) => {
        console.log(`   ${index + 1}. ${config.nombre}: ${config.valor}`);
      });
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Error configurando sistema de temas:', error);
    await mongoose.disconnect();
    return false;
  }
};

// Función principal
const main = async () => {
  console.log('📋 Pasos para configurar MongoDB Atlas:\n');
  console.log('1. Ve a MongoDB Atlas (mongodb.com/atlas)');
  console.log('2. Crea un cluster gratuito');
  console.log('3. Configura un usuario y contraseña');
  console.log('4. Configura acceso de red (Allow Access from Anywhere)');
  console.log('5. Obtén la cadena de conexión');
  console.log('6. Reemplaza la URL en el archivo .env\n');
  
  // Crear archivo .env
  createEnvFile();
  
  // Verificar si hay una URL de Atlas configurada
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
    
    if (mongoUriMatch && !mongoUriMatch[1].includes('tu_contraseña')) {
      const atlasUri = mongoUriMatch[1].trim();
      console.log('🔍 URL de MongoDB Atlas encontrada en .env');
      
      // Probar conexión
      const connected = await testAtlasConnection(atlasUri);
      if (connected) {
        // Configurar sistema de temas
        await setupThemeSystem(atlasUri);
        console.log('\n🎉 ¡Configuración completada! El sistema de temas está listo para usar.');
      }
    } else {
      console.log('\n⚠️  Por favor, edita el archivo .env y reemplaza la URL de MongoDB Atlas');
      console.log('   Ejemplo: MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/sitmah');
    }
  }
  
  console.log('\n📚 Para más información, consulta el archivo atlas-config.md');
};

main().catch(console.error); 