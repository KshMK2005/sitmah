# Configuración de MongoDB Atlas para SITMAH

## 1. Crear cuenta en MongoDB Atlas

1. Ve a [mongodb.com/atlas](https://mongodb.com/atlas)
2. Haz clic en "Try Free"
3. Completa el registro con tu email

## 2. Crear un cluster

1. **Selecciona el plan gratuito:**
   - Haz clic en "Shared" → "FREE"
   - Elige la región más cercana a tu servidor cPanel
   - Haz clic en "Create"

2. **Configurar seguridad:**
   - Username: `sitmah_user`
   - Password: `[crea una contraseña segura]`
   - Haz clic en "Create User"

3. **Configurar acceso de red:**
   - Haz clic en "Network Access"
   - Haz clic en "Add IP Address"
   - Para desarrollo: haz clic en "Allow Access from Anywhere" (0.0.0.0/0)
   - Haz clic en "Confirm"

## 3. Obtener la cadena de conexión

1. Haz clic en "Connect"
2. Selecciona "Connect your application"
3. Copia la cadena de conexión
4. **IMPORTANTE:** Reemplaza `<password>` con tu contraseña real

## 4. Ejemplo de cadena de conexión

```
mongodb+srv://sitmah_user:TuContraseña123@cluster0.abc123.mongodb.net/sitmah?retryWrites=true&w=majority
```

## 5. Configurar variables de entorno

### En tu archivo .env:
```
MONGODB_URI=mongodb+srv://sitmah_user:TuContraseña123@cluster0.abc123.mongodb.net/sitmah?retryWrites=true&w=majority
```

### En cPanel Node.js:
- Variable: `MONGODB_URI`
- Valor: `mongodb+srv://sitmah_user:TuContraseña123@cluster0.abc123.mongodb.net/sitmah?retryWrites=true&w=majority`

## 6. Probar la conexión

Ejecuta este comando para probar la conexión:
```bash
node export-to-atlas.js --test
```

## 7. Exportar datos

Una vez que la conexión funcione, ejecuta:
```bash
node export-to-atlas.js
```

## Solución de problemas

### Error: "ENOTFOUND"
- Verifica que la cadena de conexión sea correcta
- Asegúrate de reemplazar `<password>` con tu contraseña real

### Error: "Authentication failed"
- Verifica el username y password
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Network access denied"
- Ve a "Network Access" en Atlas
- Agrega tu IP o usa "Allow Access from Anywhere"

### Error: "Database not found"
- La base de datos se creará automáticamente cuando se conecte por primera vez 