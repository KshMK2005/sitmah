// Script simple para resolver conflicto de tarjetón
// Ejecutar con: node fix-tarjeton-conflict.js

const mongoose = require('mongoose');

// Configuración de la base de datos - usar la misma que en el proyecto
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sitmah:sitmah123@sitmah.0qjqx.mongodb.net/sitmah?retryWrites=true&w=majority';

async function fixTarjetonConflict() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Importar el modelo Apertura
    const Apertura = require('./src/database/models/Apertura');

    // Buscar la apertura conflictiva
    console.log('\n🔍 Buscando apertura con ID: 68b15ab6fd35648b514b4bc8');
    const aperturaConflictiva = await Apertura.findById('68b15ab6fd35648b514b4bc8');
    
    if (aperturaConflictiva) {
      console.log('✅ Apertura encontrada:');
      console.log(`   ID: ${aperturaConflictiva._id}`);
      console.log(`   Económico: ${aperturaConflictiva.economico}`);
      console.log(`   Tarjetón: ${aperturaConflictiva.tarjeton}`);
      console.log(`   Estado: ${aperturaConflictiva.estado}`);
      console.log(`   Ruta: ${aperturaConflictiva.ruta}`);
      console.log(`   Nombre: ${aperturaConflictiva.nombre}`);

      // Cambiar el estado a "completado" para liberar el tarjetón
      console.log('\n🔄 Cambiando estado a "completado"...');
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
        console.log('✅ ¡Conflicto resuelto!');
        console.log(`   Estado anterior: ${aperturaConflictiva.estado}`);
        console.log(`   Estado nuevo: ${result.estado}`);
        console.log('\n🎉 Ahora puedes crear una nueva apertura con tarjetón "013"');
      }
    } else {
      console.log('❌ No se encontró la apertura con ese ID');
      
      // Buscar todas las aperturas con tarjetón '013'
      console.log('\n🔍 Buscando todas las aperturas con tarjetón "013"...');
      const aperturas = await Apertura.find({ tarjeton: '013' });
      
      if (aperturas.length > 0) {
        console.log(`📊 Se encontraron ${aperturas.length} aperturas con tarjetón "013":`);
        aperturas.forEach((ap, i) => {
          console.log(`   ${i+1}. ID: ${ap._id}, Estado: ${ap.estado}, Económico: ${ap.economico}`);
        });
      } else {
        console.log('❌ No se encontraron aperturas con tarjetón "013"');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

// Ejecutar la función
fixTarjetonConflict();
