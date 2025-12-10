import mongoose from 'mongoose';
import fs from 'fs';

const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function importToCorporate() {
    try {
        console.log('🚀 Importando datos a cuenta corporativa...\n');
        
        // Leer datos exportados
        console.log('📖 Leyendo datos exportados...');
        const exportData = JSON.parse(fs.readFileSync('sitmah-export.json', 'utf8'));
        console.log('✅ Datos leídos correctamente');

        // Conectar a base de datos corporativa
        console.log('\n🏢 Conectando a base de datos corporativa...');
        const connection = await mongoose.connect(CORPORATE_URI);
        const db = connection.connection.db;
        console.log('✅ Conectado a base de datos corporativa');

        // Importar cada colección
        let totalImported = 0;
        
        for (const [collectionName, documents] of Object.entries(exportData)) {
            console.log(`\n📦 Importando colección: ${collectionName}`);
            
            try {
                if (documents && documents.length > 0) {
                    // Limpiar colección existente
                    await db.collection(collectionName).deleteMany({});
                    console.log(`   🧹 Colección ${collectionName} limpiada`);
                    
                    // Insertar documentos
                    await db.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ ${documents.length} documentos importados`);
                    totalImported += documents.length;
                } else {
                    console.log(`   ℹ️  No hay documentos para importar`);
                }
            } catch (error) {
                console.log(`   ❌ Error importando ${collectionName}:`, error.message);
            }
        }

        // Verificar importación
        console.log('\n🔍 Verificando importación...');
        for (const collectionName of Object.keys(exportData)) {
            try {
                const count = await db.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}:`, error.message);
            }
        }

        console.log('\n🎉 ¡Importación completada!');
        console.log(`📊 Total de documentos importados: ${totalImported}`);

        // Generar reporte final
        const reporte = {
            fecha: new Date().toISOString(),
            total_documentos_importados: totalImported,
            colecciones: Object.keys(exportData),
            status: 'COMPLETADO'
        };
        
        fs.writeFileSync('import-report.json', JSON.stringify(reporte, null, 2));
        console.log('✅ Reporte de importación guardado en import-report.json');

        await connection.disconnect();
        console.log('\n🔌 Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

importToCorporate();
