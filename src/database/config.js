import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Intentando conectar a MongoDB...');
        console.log('URI de conexión:', process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // timeout después de 5 segundos
            socketTimeoutMS: 45000, // timeout de socket después de 45 segundos
        });
        
        console.log(`MongoDB conectado exitosamente: ${conn.connection.host}`);
        console.log('Nombre de la base de datos:', conn.connection.name);
        console.log('Estado de la conexión:', conn.connection.readyState);
        
        // Agregar listener para eventos de conexión
        mongoose.connection.on('error', (err) => {
            console.error('Error en la conexión de MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconectado');
        });

    } catch (error) {
        console.error('Error detallado al conectar a MongoDB:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

export default connectDB;
