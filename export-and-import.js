import mongoose from 'mongoose';
import fs from 'fs';

const CURRENT_URI = 'mongodb+srv://sitmah_user:Tuz0bus@despacho.xnizfvc.mongodb.net/sitmah?retryWrites=true&w=majority&appName=Despacho';
const CORPORATE_URI = 'mongodb+srv://despachositmah:sitmahdes_2013@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

async function exportAndImport() {
    try {
        console.log('🚀 Iniciando exportación e importación...\n');
        
        // Conectar a base de datos actual
        console.log('📡 Conectando a base de datos actual...');
        const currentConn = await mongoose.connect(CURRENT_URI);
        const currentDb = currentConn.connection.db;
        console.log('✅ Conectado a base de datos actual');

        // Colecciones a exportar
        const collections = ['operadors', 'usuarios', 'configuracions', 'aperturas', 'programacions'];
        const exportData = {};
        
        // Exportar datos
        console.log('\n📤 Exportando datos...');
        for (const collectionName of collections) {
            try {
                const documents = await currentDb.collection(collectionName).find({}).toArray();
                exportData[collectionName] = documents;
                console.log(`✅ ${collectionName}: ${documents.length} documentos exportados`);
            } catch (error) {
                console.log(`❌ Error exportando ${collectionName}:`, error.message);
            }
        }

        // Guardar datos exportados
        const exportFile = 'sitmah-export.json';
        fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
        console.log(`\n💾 Datos exportados a ${exportFile}`);

        // Conectar a base de datos corporativa
        console.log('\n🏢 Conectando a base de datos corporativa...');
        const corporateConn = await mongoose.createConnection(CORPORATE_URI);
        const corporateDb = corporateConn.db;
        console.log('✅ Conectado a base de datos corporativa');

        // Importar datos
        console.log('\n📥 Importando datos...');
        let totalImported = 0;
        
        for (const [collectionName, documents] of Object.entries(exportData)) {
            try {
                if (documents.length > 0) {
                    // Limpiar colección
                    await corporateDb.collection(collectionName).deleteMany({});
                    
                    // Insertar documentos
                    await corporateDb.collection(collectionName).insertMany(documents);
                    console.log(`✅ ${collectionName}: ${documents.length} documentos importados`);
                    totalImported += documents.length;
                }
            } catch (error) {
                console.log(`❌ Error importando ${collectionName}:`, error.message);
            }
        }

        // Verificar importación
        console.log('\n🔍 Verificando importación...');
        for (const collectionName of collections) {
            try {
                const count = await corporateDb.collection(collectionName).countDocuments();
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.log(`❌ Error verificando ${collectionName}:`, error.message);
            }
        }

        console.log('\n🎉 ¡Migración completada!');
        console.log(`📊 Total de documentos importados: ${totalImported}`);

        // Generar reporte
        const reporte = {
            fecha: new Date().toISOString(),
            export_file: exportFile,
            total_documentos: totalImported,
            status: 'COMPLETADO'
        };
        
        fs.writeFileSync('migration-report.json', JSON.stringify(reporte, null, 2));
        console.log('✅ Reporte guardado en migration-report.json');

        // Cerrar conexiones
        await currentConn.disconnect();
        await corporateConn.close();
        console.log('\n🔌 Conexiones cerradas');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

exportAndImport();
