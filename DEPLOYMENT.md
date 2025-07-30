# Guía de Despliegue - SITMAH

## Despliegue en Render (Recomendado)

### 1. Preparación del Proyecto

1. **Asegúrate de que tu código esté en GitHub**
   ```bash
   git add .
   git commit -m "Preparar para despliegue"
   git push origin main
   ```

2. **Verifica que el proyecto funcione localmente**
   ```bash
   npm install
   npm run build
   npm start
   ```

### 2. Despliegue en Render

1. **Ve a [render.com](https://render.com) y crea una cuenta**

2. **Crea un nuevo Web Service**
   - Haz clic en "New +"
   - Selecciona "Web Service"
   - Conecta tu repositorio de GitHub

3. **Configura el servicio**
   - **Name**: `sitmah-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Configura las variables de entorno**
   - **NODE_ENV**: `production`
   - **MONGODB_URI**: Se configurará automáticamente

5. **Crea la base de datos**
   - Ve a "New +" → "PostgreSQL" (o MongoDB)
   - **Name**: `sitmah-db`
   - **Database**: `sitmah`
   - **User**: `sitmah_user`

6. **Conecta la base de datos al servicio web**
   - En tu servicio web, ve a "Environment"
   - Agrega la variable `MONGODB_URI` con la URL de conexión de la base de datos

### 3. Configuración de la Base de Datos

Una vez desplegado, necesitarás:

1. **Crear el usuario administrador**
2. **Insertar los operadores**
3. **Configurar datos iniciales**

### 4. Verificación

- Tu aplicación estará disponible en: `https://tu-app.onrender.com`
- La API estará en: `https://tu-app.onrender.com/api`

## Alternativas de Despliegue

### Railway
- Similar a Render
- Muy fácil de usar
- Soporte gratuito limitado

### Heroku
- Más establecido
- Requiere tarjeta de crédito para verificación
- Plan gratuito discontinuado

### Vercel (Solo Frontend)
- Excelente para React
- Necesitarías separar frontend y backend

## Solución de Problemas

### Error de Build
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Render

### Error de Base de Datos
- Verifica que `MONGODB_URI` esté configurada correctamente
- Asegúrate de que la base de datos esté creada

### Error de Rutas
- Verifica que el servidor esté sirviendo archivos estáticos correctamente
- Revisa la configuración de CORS 