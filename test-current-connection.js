import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testCurrentConnection() {
    try {
        console.log('🧪 Probando conexión actual...');
        console.log('URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
        
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI no está configurada');
            return;
        }

        const connection = await mongoose.createConnection(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('✅ Conexión actual exitosa');
        console.log('📊 Base de datos:', connection.db.databaseName);
        
        // Contar documentos en cada colección
        const collections = ['usuarios', 'aperturas', 'operadores', 'programaciones', 'configuraciones'];
        let totalDocs = 0;
        
        for (const collectionName of collections) {
            try {
                const count = await connection.db.collection(collectionName).countDocuments();
                console.log(`📋 ${collectionName}: ${count} documentos`);
                totalDocs += count;
            } catch (error) {
                console.log(`📋 ${collectionName}: No existe o error`);
            }
        }
        
        console.log(`📊 Total de documentos: ${totalDocs}`);
        
        await connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCurrentConnection();
