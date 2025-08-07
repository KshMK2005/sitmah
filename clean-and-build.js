import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧹 Limpiando y reconstruyendo el proyecto...\n');

try {
    // 1. Limpiar node_modules (opcional, descomenta si hay problemas)
    // console.log('1️⃣ Limpiando node_modules...');
    // if (fs.existsSync('node_modules')) {
    //     fs.rmSync('node_modules', { recursive: true, force: true });
    //     console.log('✅ node_modules eliminado');
    // }

    // 2. Limpiar dist
    console.log('2️⃣ Limpiando carpeta dist...');
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
        console.log('✅ Carpeta dist eliminada');
    }

    // 3. Limpiar caché de npm
    console.log('3️⃣ Limpiando caché de npm...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Caché de npm limpiado');

    // 4. Reinstalar dependencias
    console.log('4️⃣ Reinstalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias reinstaladas');

    // 5. Construir para producción
    console.log('5️⃣ Construyendo para producción...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completado');

    console.log('\n🎉 ¡Proyecto limpiado y reconstruido exitosamente!');
    console.log('🚀 Puedes iniciar el servidor con: npm start');

} catch (error) {
    console.error('\n❌ Error durante la limpieza:', error.message);
    process.exit(1);
} 