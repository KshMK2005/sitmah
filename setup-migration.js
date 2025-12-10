// Script para configurar la migración
// Ejecutar: node setup-migration.js

const fs = require('fs');

console.log('🚀 Configurando migración a cuenta corporativa...\n');

// Cadena de conexión corporativa (ya la tienes)
const corporateConnectionString = 'mongodb+srv://despachositmah:<db_password>@sitmah.ywhe5d8.mongodb.net/?retryWrites=true&w=majority&appName=sitmah';

console.log('📋 INSTRUCCIONES:');
console.log('1. Reemplaza <db_password> en la cadena corporativa con tu password real');
console.log('2. Obtén tu cadena de conexión actual desde Vercel o tu .env local');
console.log('3. Ejecuta: node create-env-file.js');
console.log('');

// Función para crear el archivo .env
function createEnvFile(currentConnection, corporateConnection) {
    const envContent = `# Variables para migración a cuenta corporativa
# Base de datos actual (cuenta personal)
MONGODB_URI=${currentConnection}

# Base de datos corporativa (nueva cuenta)
CORPORATE_MONGODB_URI=${corporateConnection}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado exitosamente');
    console.log('🔧 Ahora puedes ejecutar: node migrate-to-corporate-atlas.js --test');
}

// Función principal
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 2) {
        const currentConnection = args[0];
        const corporateConnection = args[1];
        createEnvFile(currentConnection, corporateConnection);
    } else {
        console.log('💡 Para crear el archivo .env automáticamente:');
        console.log('   node setup-migration.js "cadena_actual" "cadena_corporativa"');
        console.log('');
        console.log('📝 O crea manualmente el archivo .env con:');
        console.log('   MONGODB_URI=tu_cadena_actual');
        console.log('   CORPORATE_MONGODB_URI=tu_cadena_corporativa_completa');
    }
}

main();
