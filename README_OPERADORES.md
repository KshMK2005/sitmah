# Funcionalidad de Búsqueda de Operadores

## Descripción
Esta funcionalidad permite buscar y seleccionar operadores usando un buscador tipo dropdown (como el de ruta) en el formulario principal de App.jsx. La búsqueda se realiza en la colección "operadors" de la base de datos MongoDB.

## Características Implementadas

### 1. Buscador con React-Select
- Campo de búsqueda tipo dropdown similar al de ruta
- Búsqueda por tarjetón o nombre del operador
- Autocompletado automático del tarjetón y nombre al seleccionar
- Interfaz limpia y fácil de usar

### 2. Funcionalidades del Buscador
- Búsqueda en tiempo real mientras escribes
- Lista desplegable con todos los operadores disponibles
- Formato: "TARJETÓN - NOMBRE" para fácil identificación
- Opción para limpiar la selección

### 3. Integración con el Formulario
- Al seleccionar un operador, se autocompletan automáticamente:
  - Campo tarjetón
  - Campo nombre
- Mantiene la consistencia con el resto del formulario

## Archivos Modificados

### Frontend
- `src/App.jsx`: Componente principal con la funcionalidad de búsqueda
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
1. Ir a la página principal (App.jsx)
2. En el formulario "Nueva Programación", busca el campo "Operador"
3. Verás un buscador tipo dropdown igual al de "Ruta"
4. Puedes:
   - Escribir para buscar por tarjetón (ej: "TPA0001")
   - Escribir para buscar por nombre (ej: "Juan Carlos")
   - Hacer clic para ver la lista completa
5. Al seleccionar un operador, se autocompletarán automáticamente:
   - El tarjetón
   - El nombre del operador
6. Los datos aparecerán en la tabla de horarios

### 4. Ejemplos de Búsqueda
- **Por tarjetón**: Escribir "TPA0001" → Mostrará "TPA0001 - Juan Carlos Pérez López"
- **Por nombre**: Escribir "Juan" → Mostrará todos los operadores con "Juan" en el nombre
- **Lista completa**: Hacer clic en el campo para ver todos los operadores disponibles

## Script de Pruebas
```bash
# Ejecutar prueba del buscador en App.jsx
node testAppOperadores.js
```

Este script verifica:
- Conexión a la base de datos
- Carga de operadores
- Búsquedas específicas
- Disponibilidad de datos para el buscador

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