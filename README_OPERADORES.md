# Funcionalidad de Búsqueda de Operadores

## Descripción
Esta funcionalidad permite buscar automáticamente el nombre de un operador cuando se ingresa su tarjetón en el formulario de apertura. La búsqueda se realiza en la colección "operadors" de la base de datos MongoDB.

## Características Implementadas

### 1. Búsqueda Automática
- Al ingresar un tarjetón en el campo correspondiente, se busca automáticamente en la base de datos
- Si se encuentra el operador, se autocompleta el campo "Nombre del Operador"
- La búsqueda se activa cuando el tarjetón tiene al menos 3 caracteres

### 2. Normalización de Datos
- Los tarjetones se normalizan automáticamente (espacios eliminados, mayúsculas)
- Búsqueda flexible que maneja variaciones en el formato del tarjetón

### 3. Feedback Visual
- Indicador de búsqueda en progreso
- Mensajes de éxito/error discretos
- Colores diferenciados en el campo de nombre según el estado

### 4. Manejo de Errores
- Timeout de 5 segundos para evitar esperas indefinidas
- Manejo de errores de conexión
- Mensajes informativos para el usuario

## Archivos Modificados

### Frontend
- `src/Apertura.jsx`: Componente principal con la funcionalidad de búsqueda
- `src/services/operadores.js`: Servicio para comunicarse con la API

### Backend
- `server/routes/operadorRoutes.js`: Rutas de la API para operadores
- `src/database/models/Operador.js`: Modelo de datos con métodos de búsqueda

## Cómo Probar la Funcionalidad

### 1. Preparar la Base de Datos
```bash
# Navegar al directorio del proyecto
cd sitmah

# Cargar datos de ejemplo de operadores
node src/database/seedOperadores.js
```

### 2. Iniciar el Servidor
```bash
# Iniciar el servidor backend
npm run dev

# En otra terminal, iniciar el frontend
npm run dev
```

### 3. Probar la Funcionalidad
1. Ir a la página de Apertura
2. En el campo "Tarjetón", ingresar uno de estos valores:
   - `TPA0001` → Debería mostrar "Juan Carlos Pérez López"
   - `TPA0002` → Debería mostrar "María Elena Rodríguez García"
   - `TPA0005` → Debería mostrar "Carlos Alberto Herrera Jiménez"

### 4. Probar Casos Especiales
- **Con espacios**: ` TPA0001 ` (debería funcionar igual)
- **Minúsculas**: `tpa0001` (debería funcionar igual)
- **Inexistente**: `TPA9999` (debería mostrar "Usuario no encontrado")

### 5. Botones de Prueba
- **"Probar Búsqueda (TPA0001)"**: Prueba manual con un tarjetón específico
- **"Verificar Base de Datos"**: Muestra el estado de la conexión y datos disponibles

## Script de Pruebas Automatizadas
```bash
# Ejecutar pruebas automatizadas
node testOperadores.js
```

Este script verifica:
- Conexión a la base de datos
- Búsquedas exitosas
- Búsquedas inexistentes
- Manejo de variaciones en el formato

## Estructura de Datos

### Colección: `operadors`
```javascript
{
  id: Number,        // ID único del operador
  tarjeton: String,  // Número de tarjetón (único)
  nombre: String     // Nombre completo del operador
}
```

### Ejemplos de Datos
- `TPA0001` → Juan Carlos Pérez López
- `TPA0002` → María Elena Rodríguez García
- `TPA0003` → Roberto Antonio Silva Mendoza
- ... (hasta TPA0010)

## Troubleshooting

### Problemas Comunes

1. **"Error de conexión"**
   - Verificar que el servidor esté corriendo
   - Verificar la conexión a MongoDB
   - Usar el botón "Verificar Base de Datos"

2. **"Usuario no encontrado"**
   - Verificar que los datos estén cargados en la base de datos
   - Ejecutar `node src/database/seedOperadores.js`
   - Verificar el formato del tarjetón

3. **Búsqueda no funciona**
   - Verificar la consola del navegador para errores
   - Verificar que la API esté respondiendo en `/api/operadores/status`
   - Verificar que el servidor esté en el puerto correcto

### Logs de Debug
- Los logs detallados se muestran en la consola del navegador
- Los logs del servidor se muestran en la terminal donde corre el backend
- Usar `console.log` para debugging adicional si es necesario

## Mejoras Futuras
- Búsqueda en tiempo real mientras se escribe
- Autocompletado con sugerencias
- Historial de búsquedas recientes
- Búsqueda por nombre además de tarjetón
- Cache local para búsquedas frecuentes 