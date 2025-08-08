# 📊 Template para Importación Masiva de Aperturas

## 📋 Columnas del Excel/CSV

| Columna | Descripción | Obligatorio | Ejemplo |
|---------|-------------|-------------|---------|
| **TIPO DE UNIDAD** | Tipo de vehículo | ✅ | GRAN VIALE, BOXER, SPRINTER, VAGONETA, ORION |
| **RUTA** | Ruta asignada | ✅ | RUTA 1, RUTA 2, etc. |
| **ECONOMICO** | Número económico | ✅ | 1234 |
| **TARJETON** | Número de tarjetón | ✅ | 5678 |
| **NOMBRE** | Nombre del operador | ✅ | JUAN PEREZ |
| **HORA_SALIDA** | Hora de salida programada | ❌ | 04:30, 05:00 |
| **COMENTARIO** | Observaciones adicionales | ❌ | Unidad de respaldo |

## 🔄 Sincronización Automática de Horas

### ¿Cómo funciona?
1. **Si especificas HORA_SALIDA en el Excel**: Se usa esa hora directamente
2. **Si NO especificas HORA_SALIDA**: El sistema busca automáticamente:
   - Primero: Programación exacta (misma ruta + mismo tipo de unidad)
   - Segundo: Programación por ruta (solo ruta)
   - Tercero: Hora por defecto (04:30)

### Ventajas:
- ✅ **Flexibilidad**: Puedes especificar horas específicas en el Excel
- ✅ **Automatización**: Si no especificas, se sincroniza con programaciones existentes
- ✅ **Consistencia**: Mantiene la coherencia con las programaciones del sistema

## 📝 Instrucciones de Uso

1. **Descarga el template**: `programacion_template.csv`
2. **Llena los datos**: Al menos las 5 columnas obligatorias
3. **Opcional**: Agrega HORA_SALIDA y COMENTARIO si lo necesitas
4. **Sube el archivo**: Usa el botón "📊 Cargar Excel Masivo"
5. **Revisa la previsualización**: Confirma que los datos sean correctos
6. **Confirma la importación**: Los datos aparecerán en Verificador

## ⚠️ Notas Importantes

- **Estado**: Todas las unidades se importan con estado "dashboard" (pendientes de verificación)
- **Fecha**: Se usa automáticamente la fecha actual
- **Campos faltantes**: Se rellenan desde las programaciones existentes
- **Validación**: El sistema valida que existan programaciones correspondientes

## 🗑️ Limpieza de Datos

Si necesitas eliminar datos importados de prueba:
- Usa el botón "🗑️ Limpiar Datos Importados"
- Solo elimina registros con estado "dashboard" de hoy
- Requiere confirmación antes de eliminar

