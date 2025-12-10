const mongoose = require('mongoose');
const Apertura = require('./src/database/models/Apertura');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah';

async function cleanAperturas() {
  try {
    // Conectar a la base de datos
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB exitosamente');

    // Buscar aperturas activas problemáticas
    console.log('\nBuscando aperturas activas...');
    const aperturasActivas = await Apertura.find({
      estado: { $in: ['pendiente', 'completado'] }
    }).sort({ fechaApertura: -1 });

    console.log(`Se encontraron ${aperturasActivas.length} aperturas activas:`);
    
    aperturasActivas.forEach(apertura => {
      console.log(`- ID: ${apertura._id}`);
      console.log(`  Económico: ${apertura.economico}`);
      console.log(`  Tarjetón: ${apertura.tarjeton}`);
      console.log(`  Estado: ${apertura.estado}`);
      console.log(`  Fecha: ${apertura.fechaApertura}`);
      console.log('---');
    });

    // Buscar específicamente la apertura con económico '1'
    const aperturaProblematica = await Apertura.findOne({
      economico: '1',
      estado: { $in: ['pendiente', 'completado'] }
    });

    if (aperturaProblematica) {
      console.log(`\nApertura problemática encontrada:`);
      console.log(`ID: ${aperturaProblematica._id}`);
      console.log(`Económico: ${aperturaProblematica.economico}`);
      console.log(`Estado: ${aperturaProblematica.estado}`);
      
      // Preguntar si se quiere cancelar esta apertura
      console.log('\n¿Deseas cancelar esta apertura? (s/n)');
      // Por ahora, asumimos que sí y la cancelamos
      
      // Cancelar la apertura problemática
      await Apertura.findByIdAndUpdate(aperturaProblematica._id, {
        estado: 'cancelado',
        ultimaModificacion: {
          usuario: 'sistema',
          fecha: new Date()
        }
      });
      
      console.log('Apertura cancelada exitosamente');
    } else {
      console.log('\nNo se encontró apertura problemática con económico "1"');
    }

    // Mostrar estadísticas finales
    const estadisticas = await Apertura.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nEstadísticas actuales:');
    estadisticas.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexión cerrada');
  }
}

// Ejecutar el script
cleanAperturas(); 