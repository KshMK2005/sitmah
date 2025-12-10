const mongoose = require('mongoose');
const Apertura = require('./src/database/models/Apertura');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah';

async function checkAperturaConflict() {
  try {
    // Conectar a la base de datos
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB exitosamente');

    // Buscar la apertura específica que está causando el conflicto
    console.log('\n🔍 Buscando apertura con ID: 68b15ab6fd35648b514b4bc8');
    const aperturaConflictiva = await Apertura.findById('68b15ab6fd35648b514b4bc8');
    
    if (aperturaConflictiva) {
      console.log('✅ Apertura encontrada:');
      console.log(`   ID: ${aperturaConflictiva._id}`);
      console.log(`   Económico: ${aperturaConflictiva.economico}`);
      console.log(`   Tarjetón: ${aperturaConflictiva.tarjeton}`);
      console.log(`   Estado: ${aperturaConflictiva.estado}`);
      console.log(`   Ruta: ${aperturaConflictiva.ruta}`);
      console.log(`   Fecha: ${aperturaConflictiva.fechaApertura}`);
      console.log(`   Nombre: ${aperturaConflictiva.nombre}`);
    } else {
      console.log('❌ No se encontró la apertura con ese ID');
    }

    // Buscar todas las aperturas activas con tarjetón '013'
    console.log('\n🔍 Buscando todas las aperturas activas con tarjetón "013"');
    const aperturasActivas = await Apertura.find({
      tarjeton: '013',
      estado: { $in: ['apertura', 'pendiente', 'en_verificacion'] }
    });

    console.log(`\n📊 Se encontraron ${aperturasActivas.length} aperturas activas con tarjetón "013":`);
    
    aperturasActivas.forEach((apertura, index) => {
      console.log(`\n   ${index + 1}. ID: ${apertura._id}`);
      console.log(`      Económico: ${apertura.economico}`);
      console.log(`      Tarjetón: ${apertura.tarjeton}`);
      console.log(`      Estado: ${apertura.estado}`);
      console.log(`      Ruta: ${apertura.ruta}`);
      console.log(`      Fecha: ${apertura.fechaApertura}`);
      console.log(`      Nombre: ${apertura.nombre}`);
    });

    // Mostrar opciones para resolver el conflicto
    console.log('\n💡 OPCIONES PARA RESOLVER EL CONFLICTO:');
    console.log('1. Cambiar el estado de la apertura existente a "completado"');
    console.log('2. Cambiar el estado de la apertura existente a "cancelado"');
    console.log('3. Usar un tarjetón diferente en tu nueva apertura');
    console.log('4. Eliminar la apertura existente (solo si es de prueba)');

    // Preguntar si quiere resolver automáticamente
    console.log('\n🤔 ¿Quieres que cambie automáticamente el estado de la apertura existente a "completado"?');
    console.log('   (Esto permitirá crear la nueva apertura con tarjetón "013")');
    
    // En un entorno real, aquí podrías usar readline para preguntar al usuario
    // Por ahora, solo mostramos la información

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Función para resolver el conflicto automáticamente
async function resolveConflict() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB exitosamente');

    // Cambiar el estado de la apertura conflictiva a "completado"
    const result = await Apertura.findByIdAndUpdate(
      '68b15ab6fd35648b514b4bc8',
      { 
        estado: 'completado',
        ultimaModificacion: {
          usuario: 'sistema',
          fecha: new Date()
        }
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Apertura actualizada exitosamente:');
      console.log(`   ID: ${result._id}`);
      console.log(`   Estado anterior: pendiente/apertura/en_verificacion`);
      console.log(`   Estado nuevo: ${result.estado}`);
      console.log(`   Tarjetón: ${result.tarjeton}`);
      console.log('\n🎉 Ahora puedes crear una nueva apertura con tarjetón "013"');
    } else {
      console.log('❌ No se pudo actualizar la apertura');
    }

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

// Ejecutar según el argumento
const action = process.argv[2];

if (action === 'resolve') {
  resolveConflict();
} else {
  checkAperturaConflict();
}



