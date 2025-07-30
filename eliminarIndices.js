// Script para eliminar los índices únicos de economico y tarjeton en la colección aperturas
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sitmah', { useNewUrlParser: true, useUnifiedTopology: true }); // Cambia la URL si tu base es diferente

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', async function () {
  try {
    await db.collection('aperturas').dropIndex('economico_1');
    console.log('Índice único de economico eliminado');
  } catch (err) {
    console.error('Error al eliminar índice economico:', err.message);
  }
  try {
    await db.collection('aperturas').dropIndex('tarjeton_1');
    console.log('Índice único de tarjeton eliminado');
  } catch (err) {
    console.error('Error al eliminar índice tarjeton:', err.message);
  }
  db.close();
});
