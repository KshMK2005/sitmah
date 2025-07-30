const mongoose = require('mongoose');
const Usuario = require('./server/database/models/Usuario');

// Configuración de la base de datos (usando la misma configuración del proyecto)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah';

async function createAdminUser() {
  try {
    // Conectar a la base de datos
    console.log('Intentando conectar a MongoDB...');
    console.log('URI de conexión:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Conectado a MongoDB exitosamente');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await Usuario.findOne({ usuario: 'admin' });
    if (existingAdmin) {
      console.log('El usuario administrador ya existe');
      console.log('Usuario:', existingAdmin.usuario);
      console.log('Rol:', existingAdmin.rol);
      return;
    }

    // Crear el usuario administrador
    const adminUser = new Usuario({
      usuario: 'admin',
      password: 'admin123', // Cambia esta contraseña por una más segura
      rol: 'administrador',
      tarjeton: 'ADMIN001',
      correo: 'admin@sitmah.com'
    });

    // Guardar el usuario
    await adminUser.save();
    console.log('Usuario administrador creado exitosamente');
    console.log('Usuario:', adminUser.usuario);
    console.log('Rol:', adminUser.rol);
    console.log('Contraseña: admin123 (cámbiala por seguridad)');

  } catch (error) {
    console.error('Error al crear el usuario administrador:', error.message);
    if (error.code === 11000) {
      console.log('El usuario administrador ya existe');
    }
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

// Ejecutar el script
createAdminUser(); 