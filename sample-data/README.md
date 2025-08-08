Sample data for bulk scheduling import

Coloca aquí el archivo Excel/CSV con la programación diaria para realizar la carga masiva.

Sugerencia de columnas (encabezados):

- Ruta
- TipoUnidad
- Economico
- Tarjeton
- Operador
- FechaServicio
- Observaciones

Notas:
- Campos como HoraSalida, Intervalo y NumeroCorrida no son obligatorios en el Excel; se aplicarán reglas/plantillas por ruta/tipoUnidad al importar.
- La clave recomendada para evitar duplicados es (FechaServicio + Economico).
- Puedes usar el archivo `programacion_template.csv` como guía.

