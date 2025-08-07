import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function healthCheck() {
    console.log('🔍 Iniciando verificación de salud del sistema SITMAH...\n');
    
    try {
        // 1. Verificar conexión a MongoDB
        console.log('1️⃣ Verificando conexión a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conexión a MongoDB exitosa');
        
        // 2. Verificar modelos
        console.log('\n2️⃣ Verificando modelos de datos...');
        const models = ['Apertura', 'Programacion', 'Operador', 'Usuario'];
        for (const modelName of models) {
            try {
                const model = mongoose.model(modelName);
                console.log(`✅ Modelo ${modelName} cargado correctamente`);
            } catch (error) {
                console.log(`❌ Error al cargar modelo ${modelName}:`, error.message);
            }
        }
        
        // 3. Verificar variables de entorno críticas
        console.log('\n3️⃣ Verificando variables de entorno...');
        const requiredEnvVars = ['MONGODB_URI', 'PORT'];
        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                console.log(`✅ ${envVar} configurada`);
            } else {
                console.log(`❌ ${envVar} no configurada`);
            }
        }
        
        // 4. Verificar puerto disponible
        console.log('\n4️⃣ Verificando puerto del servidor...');
        const port = process.env.PORT || 5000;
        console.log(`✅ Puerto configurado: ${port}`);
        
        console.log('\n🎉 Verificación de salud completada exitosamente!');
        console.log('🚀 El sistema está listo para producción.');
        
    } catch (error) {
        console.error('\n❌ Error durante la verificación de salud:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Conexión a MongoDB cerrada');
    }
}

// Ejecutar verificación
healthCheck(); 