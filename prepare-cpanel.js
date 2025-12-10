const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando archivos para cPanel...');

// Crear estructura de directorios
const dirs = [
    'cpanel-deploy/api',
    'cpanel-deploy/dist',
    'cpanel-deploy/api/routes',
    'cpanel-deploy/api/src/database/models'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Creado directorio: ${dir}`);
    }
});

// Copiar archivos del servidor
const serverFiles = [
    'server/index.js',
    'server/package.json',
    'server/routes/programacionRoutes.js',
    'server/routes/aperturaRoutes.js',
    'server/routes/usuarioRoutes.js',
    'server/routes/operadorRoutes.js',
    'server/database/models/Usuario.js',
    'src/database/models/Apertura.js',
    'src/database/models/Programacion.js',
    'src/database/models/Operador.js',
    'src/database/config.js'
];

serverFiles.forEach(file => {
    const source = file;
    const dest = `cpanel-deploy/api/${file.replace('server/', '').replace('src/', '')}`;
    
    if (fs.existsSync(source)) {
        // Crear directorio de destino si no existe
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(source, dest);
        console.log(`✅ Copiado: ${source} → ${dest}`);
    } else {
        console.log(`❌ No encontrado: ${source}`);
    }
});

// Copiar archivos de configuración
const configFiles = [
    '.htaccess',
    'cpanel-setup.md'
];

configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, `cpanel-deploy/${file}`);
        console.log(`✅ Copiado: ${file} → cpanel-deploy/${file}`);
    }
});

// Crear package.json específico para cPanel
const packageJson = {
    "name": "sitmah-api",
    "version": "1.0.0",
    "description": "API para SITMAH - Sistema de Transporte",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.0.3",
        "mongoose": "^7.0.3"
    },
    "engines": {
        "node": ">=18.0.0"
    }
};

fs.writeFileSync('cpanel-deploy/api/package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Creado package.json para cPanel');

// Crear archivo de variables de entorno de ejemplo
const envExample = `# Configuración para cPanel + MongoDB Atlas
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://sitmah_user:tu_contraseña@cluster.mongodb.net/sitmah?retryWrites=true&w=majority

# Reemplaza 'tu_contraseña' con la contraseña real de tu usuario de MongoDB Atlas
# Reemplaza 'cluster.mongodb.net' con tu cluster real de MongoDB Atlas
`;

fs.writeFileSync('cpanel-deploy/api/.env.example', envExample);
console.log('✅ Creado .env.example para cPanel');

// Crear README para cPanel
const readme = `# SITMAH - Despliegue en cPanel

## Instrucciones de instalación:

1. **Subir archivos:**
   - Sube la carpeta \`api/\` a tu servidor cPanel
   - Sube la carpeta \`dist/\` (después de hacer build) a tu servidor cPanel
   - Sube el archivo \`.htaccess\` a la raíz de public_html

2. **Configurar Node.js en cPanel:**
   - Ve a "Node.js" en cPanel
   - Crea una nueva aplicación
   - Application root: \`/home/usuario/public_html/api\`
   - Startup file: \`index.js\`
   - Node.js version: 18.x o superior

3. **Configurar variables de entorno:**
   - Copia \`.env.example\` a \`.env\`
   - Configura tu cadena de conexión de MongoDB Atlas

4. **Instalar dependencias:**
   - En cPanel Node.js, haz clic en "Run NPM Install"

5. **Iniciar aplicación:**
   - Haz clic en "Restart App"

## Estructura final:
\`\`\`
public_html/
├── api/           # Backend Node.js
├── dist/          # Frontend React
└── .htaccess      # Configuración Apache
\`\`\`

## URLs:
- Frontend: https://tu-dominio.com/
- API: https://tu-dominio.com/api/
`;

fs.writeFileSync('cpanel-deploy/README.md', readme);
console.log('✅ Creado README para cPanel');

console.log('\n🎉 ¡Archivos preparados para cPanel!');
console.log('\n📁 Estructura creada en: cpanel-deploy/');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecuta: npm run build');
console.log('2. Copia la carpeta dist/ a cpanel-deploy/dist/');
console.log('3. Sube la carpeta cpanel-deploy/ a tu servidor cPanel');
console.log('4. Sigue las instrucciones en cpanel-deploy/README.md'); 