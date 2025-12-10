# Guía de Migración a Cuenta Corporativa MongoDB Atlas

## 🎯 Objetivo
Migrar el proyecto SITMAH de una cuenta personal de MongoDB Atlas a una cuenta corporativa del organismo.

## 📋 Prerrequisitos
- Acceso a la cuenta actual de MongoDB Atlas (personal)
- Capacidad de crear una nueva cuenta corporativa en MongoDB Atlas
- Acceso administrativo al proyecto en Vercel

## 🚀 Pasos de Migración

### Paso 1: Crear Cuenta Corporativa en MongoDB Atlas
1. Ir a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crear nueva cuenta con email corporativo
3. Verificar email corporativo
4. Completar información de la organización

### Paso 2: Configurar Cluster Corporativo
1. En la nueva cuenta, crear un nuevo proyecto: "SITMAH"
2. Crear un nuevo cluster (recomendado: M0 Sandbox para desarrollo)
3. Configurar región (preferiblemente la misma que el cluster actual)
4. Nombrar el cluster (ej: "sitmah-corporativo")

### Paso 3: Configurar Base de Datos
1. Crear base de datos: `sitmah`
2. Crear usuario de base de datos:
   - Username: `sitmah_user` (o similar)
   - Password: Generar password segura
   - Roles: `readWrite` en la base de datos `sitmah`

### Paso 4: Configurar Acceso de Red
1. En "Network Access", agregar IP:
   - Para desarrollo: `0.0.0.0/0` (permite desde cualquier IP)
   - Para producción: IPs específicas de Vercel

### Paso 5: Obtener Cadena de Conexión
1. En "Database Access", hacer clic en "Connect"
2. Seleccionar "Connect your application"
3. Driver: Node.js
4. Version: 4.1 or later
5. Copiar la cadena de conexión
6. Reemplazar `<password>` con la password del usuario creado

### Paso 6: Preparar Variables de Entorno
1. Copiar `env-corporate-example.txt` a `.env`
2. Actualizar las variables:
   - `MONGODB_URI`: Cadena de conexión actual (personal)
   - `CORPORATE_MONGODB_URI`: Nueva cadena de conexión (corporativa)

### Paso 7: Ejecutar Migración
```bash
# Instalar dependencias si es necesario
npm install

# Probar conexiones primero
node migrate-to-corporate-atlas.js --test

# Ejecutar migración completa
node migrate-to-corporate-atlas.js
```

### Paso 8: Actualizar Variables en Vercel
1. Ir al dashboard de Vercel
2. Seleccionar el proyecto SITMAH
3. Ir a Settings > Environment Variables
4. Actualizar `MONGODB_URI` con la nueva cadena de conexión corporativa
5. Hacer redeploy del proyecto

### Paso 9: Verificar Migración
1. Acceder a la aplicación en Vercel
2. Verificar que el login funcione
3. Revisar que los datos estén presentes
4. Probar funcionalidades principales

### Paso 10: Limpieza
1. Una vez confirmado que todo funciona:
   - Eliminar la base de datos de la cuenta personal
   - Transferir acceso de la cuenta corporativa al equipo técnico
   - Documentar credenciales en lugar seguro

## 🔍 Verificación Post-Migración

### Checklist de Verificación
- [ ] Login funciona correctamente
- [ ] Dashboard muestra datos
- [ ] Módulo Apertura funciona
- [ ] Módulo Verificador funciona
- [ ] Historial muestra registros
- [ ] Subida de Excel funciona
- [ ] Todas las operaciones CRUD funcionan

### Comandos de Verificación
```bash
# Verificar conexión a nueva base de datos
node migrate-to-corporate-atlas.js --test

# Revisar logs de la aplicación
# En Vercel: Functions > View Function Logs
```

## 🚨 Rollback (En caso de problemas)

Si algo sale mal, puedes revertir rápidamente:

1. En Vercel, cambiar `MONGODB_URI` de vuelta a la cadena original
2. Hacer redeploy
3. Verificar que la aplicación funcione con la base de datos original

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisar logs de la aplicación
2. Verificar conectividad de red
3. Confirmar que las credenciales son correctas
4. Verificar que la IP está en whitelist

## 📝 Documentación Post-Migración

Después de la migración exitosa, documentar:
- Credenciales de acceso (en lugar seguro)
- Información de contacto del administrador
- Procedimientos de backup/restore
- Políticas de acceso y seguridad
