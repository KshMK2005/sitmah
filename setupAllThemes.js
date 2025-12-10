import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🎨 Configurando todos los temas en la base de datos...\n');

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Conectando a la base de datos...');
    
    // Intentar conectar con la URI del .env o usar local
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah';
    
    if (uri.includes('<db_password>')) {
      console.log('⚠️  Usando base de datos local (MONGODB_URI no configurada)');
    }
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ Conectado exitosamente a: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
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

// Función para configurar todos los temas
const setupAllThemes = async () => {
  try {
    console.log('🎨 Configurando todos los temas disponibles...\n');
    
    // Definir todos los temas con sus descripciones
    const temas = [
      {
        nombre: 'temaGlobal',
        valor: 'normal',
        descripcion: 'Tema normal (predeterminado)'
      },
      {
        nombre: 'temaNormal',
        valor: 'normal',
        descripcion: 'Tema estándar de la aplicación'
      },
      {
        nombre: 'temaSanValentin',
        valor: 'sanvalentin',
        descripcion: 'Tema romántico de San Valentín'
      },
      {
        nombre: 'temaNavidad',
        valor: 'navidad',
        descripcion: 'Tema festivo de Navidad'
      },
      {
        nombre: 'temaMuertos',
        valor: 'muertos',
        descripcion: 'Tema del Día de los Muertos'
      },
      {
        nombre: 'temaGrises',
        valor: 'grises',
        descripcion: 'Tema en escala de grises'
      }
    ];
    
    // Crear o actualizar cada tema
    for (const tema of temas) {
      console.log(`🔄 Configurando: ${tema.nombre} = ${tema.valor}`);
      
      await Configuracion.findOneAndUpdate(
        { nombre: tema.nombre },
        { 
          $set: { 
            valor: tema.valor,
            descripcion: tema.descripcion,
            fechaActualizacion: new Date()
          }
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ ${tema.nombre} configurado correctamente`);
    }
    
    // Mostrar todos los temas configurados
    console.log('\n📋 Todos los temas configurados en la base de datos:');
    const todasConfigs = await Configuracion.find();
    todasConfigs.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.nombre}: ${config.valor} - ${config.descripcion}`);
    });
    
    // Mostrar el tema global actual
    const temaGlobal = await Configuracion.findOne({ nombre: 'temaGlobal' });
    console.log(`\n🎯 Tema global actual: ${temaGlobal.valor}`);
    
    // Mostrar cómo usar los temas
    console.log('\n🔄 Cómo usar los temas:');
    console.log('   1. El administrador puede cambiar el tema usando el botón "🎨 Tema"');
    console.log('   2. Todos los usuarios verán el mismo tema automáticamente');
    console.log('   3. Los cambios se sincronizan en tiempo real');
    console.log('   4. El tema se mantiene entre sesiones');
    
    return true;
  } catch (error) {
    console.error('❌ Error configurando temas:', error);
    return false;
  }
};

// Función para probar el cambio de temas
const testThemeChanges = async () => {
  try {
    console.log('\n🧪 Probando cambios de tema...');
    
    const temasDisponibles = ['normal', 'sanvalentin', 'navidad', 'muertos', 'grises'];
    
    for (const tema of temasDisponibles) {
      console.log(`\n🔄 Cambiando tema a: ${tema}`);
      
      await Configuracion.findOneAndUpdate(
        { nombre: 'temaGlobal' },
        { 
          $set: { 
            valor: tema,
            descripcion: `Tema ${tema} activo`,
            fechaActualizacion: new Date()
          }
        },
        { new: true }
      );
      
      const temaActual = await Configuracion.findOne({ nombre: 'temaGlobal' });
      console.log(`✅ Tema cambiado a: ${temaActual.valor}`);
      
      // Pequeña pausa para ver el cambio
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Restaurar tema normal
    console.log('\n🔄 Restaurando tema a: normal');
    await Configuracion.findOneAndUpdate(
      { nombre: 'temaGlobal' },
      { 
        $set: { 
          valor: 'normal',
          descripcion: 'Tema normal (predeterminado)',
          fechaActualizacion: new Date()
        }
      },
      { new: true }
    );
    
    console.log('✅ Tema restaurado a: normal');
    
    return true;
  } catch (error) {
    console.error('❌ Error probando cambios de tema:', error);
    return false;
  }
};

// Función principal
const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log('\n❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }
  
  const success = await setupAllThemes();
  if (success) {
    console.log('\n🎉 ¡Todos los temas configurados exitosamente!');
    
    // Preguntar si quiere probar los cambios
    console.log('\n🧪 ¿Quieres probar los cambios de tema? (s/n)');
    // Por ahora, ejecutar automáticamente
    await testThemeChanges();
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Configuración completada');
};

main().catch(console.error); 