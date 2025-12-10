# Despliegue en cPanel + MongoDB Atlas

## 1. Configurar MongoDB Atlas

### Crear cuenta y cluster:
1. Ve a [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (Shared - Free)
4. Elige la región más cercana a tu servidor

### Configurar acceso:
1. **Database Access** → "Add New Database User"
   - Username: `sitmah_user`
   - Password: `[contraseña segura]`
   - Role: `Read and write to any database`

2. **Network Access** → "Add IP Address"
   - Agrega la IP de tu servidor cPanel
   - O usa `0.0.0.0/0` para permitir acceso desde cualquier lugar (solo para desarrollo)

3. **Obtener cadena de conexión:**
   - Ve a "Connect" → "Connect your application"
   - Copia la cadena de conexión
   - Reemplaza `<password>` con tu contraseña real

## 2. Preparar archivos para cPanel

### Estructura de archivos:
```
public_html/
├── api/           # Backend Node.js
│   ├── server.js
│   ├── package.json
│   └── routes/
├── dist/          # Frontend React (build)
│   ├── index.html
│   └── assets/
└── .htaccess      # Configuración Apache
```

### Configurar .htaccess:
```apache
RewriteEngine On

# Redirigir API calls al backend
RewriteRule ^api/(.*)$ api/server.js [QSA,L]

# Servir archivos estáticos
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ dist/index.html [QSA,L]
```

## 3. Configurar Node.js en cPanel

### Verificar soporte Node.js:
1. En cPanel, busca "Node.js"
2. Si no está disponible, contacta a tu proveedor
3. Crea una nueva aplicación Node.js

### Configurar la aplicación:
- **Node.js version**: 18.x o superior
- **Application mode**: Production
- **Application root**: `/home/usuario/public_html/api`
- **Application URL**: `tu-dominio.com/api`
- **Application startup file**: `server.js`

## 4. Variables de entorno en cPanel

En la configuración de Node.js, agrega:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://sitmah_user:tu_contraseña@cluster.mongodb.net/sitmah?retryWrites=true&w=majority
PORT=3000
```

## 5. Subir archivos

### Backend (carpeta api/):
- `server.js`
- `package.json`
- `routes/`
- `src/database/`

### Frontend (carpeta dist/):
- Ejecutar `npm run build` localmente
- Subir la carpeta `dist/` completa

## 6. Instalar dependencias

En cPanel Node.js:
1. Ve a "Manage Node.js App"
2. Haz clic en "Run NPM Install"
3. Espera a que termine la instalación

## 7. Iniciar la aplicación

1. En cPanel Node.js, haz clic en "Restart App"
2. Verifica que esté corriendo en "Status: Running"

## 8. Configurar dominio

### Subdominio para API:
- Crea un subdominio: `api.tu-dominio.com`
- Apunta a la carpeta `/public_html/api`

### Dominio principal:
- Apunta a `/public_html`
- Servirá el frontend React

## 9. Verificación

### Probar API:
```
https://api.tu-dominio.com/
https://api.tu-dominio.com/api/operadores
```

### Probar Frontend:
```
https://tu-dominio.com/
```

## 10. Configurar SSL

1. En cPanel, ve a "SSL/TLS"
2. Instala certificado Let's Encrypt (gratis)
3. Configura redirección HTTPS

## Solución de Problemas

### Error de conexión a MongoDB:
- Verifica la cadena de conexión
- Confirma que la IP esté en whitelist
- Revisa logs en cPanel

### Error de módulos:
- Ejecuta `npm install` en cPanel
- Verifica que todas las dependencias estén en package.json

### Error de rutas:
- Verifica configuración de .htaccess
- Confirma que los archivos estén en las carpetas correctas 