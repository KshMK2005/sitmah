import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Apertura.css';
import logoSitmah from './assets/logo-sitmah.png';
import Swal from 'sweetalert2';
import Navbar from './components/Navbar';
import { useTransition } from './components/TransitionContext';
import { aperturaService, programacionService } from './services/api';
import { operadorService } from './services/operadores';
import Select from 'react-select';
import * as XLSX from 'xlsx';

function Apertura() {
  const location = useLocation();
  const { navigateWithTransition } = useTransition();
  const { horarioId, horarioData } = location.state || {};
  
  // Detectar si estamos en producción
  const isProduction = window.location.hostname !== 'localhost';

  const [formData, setFormData] = useState({
    tipoUnidad: '',
    ruta: '',
    intervalo: '',
    corridaInicial: '',
    corridaFinal: '',
    horaSalida: '',
    economico: '',
    tarjeton: '',
    nombre: '',
    comentario: '' // Asegura que el campo comentario esté en el estado
  });

  const [horario, setHorario] = useState(null);
  const [programaciones, setProgramaciones] = useState([]);
  const [operadorEncontrado, setOperadorEncontrado] = useState(false);
  const [operadorNoEncontrado, setOperadorNoEncontrado] = useState(false);
  const [buscandoOperador, setBuscandoOperador] = useState(false);
  
  // Estados para importador masivo
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    tipoUnidad: 'TIPO DE UNIDAD',
    ruta: 'RUTA',
    economico: 'ECONOMICO',
    tarjeton: 'No. DE TARJETON',
    nombre: 'NOMBRE'
  });

  useEffect(() => {
    if (!horarioId) {
      navigateWithTransition('/horarios');
      return;
    }
    // Cargar horarios desde localStorage
    const horariosGuardados = JSON.parse(localStorage.getItem('horariosActuales') || '[]');
    const horarioEncontrado = horariosGuardados.find(h => h.id === horarioId);
    if (horarioEncontrado) {
      setHorario(horarioEncontrado);
      setFormData(prev => ({
        ...prev,
        ruta: horarioEncontrado.ruta,
        intervalo: horarioEncontrado.intervalo || '',
        corridaInicial: horarioEncontrado.corridaIni || '',
        corridaFinal: horarioEncontrado.corridaFin || '',
        horaSalida: horarioEncontrado.horaSalida || '',
      }));
      if (horarioEncontrado.apertura) {
        setFormData(prev => ({
          ...prev,
          ...horarioEncontrado.apertura
        }));
      }
    } else {
      navigateWithTransition('/horarios');
    }
  }, [horarioId, navigateWithTransition]);

  useEffect(() => {
    // Cargar programaciones al iniciar
    const cargarProgramaciones = async () => {
      try {
        const data = await programacionService.getAll();
        setProgramaciones(data);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar las programaciones',
          icon: 'error'
        });
      }
    };
    cargarProgramaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar que tenemos los datos necesarios
      if (!formData.tipoUnidad || !formData.economico || !formData.tarjeton || !formData.nombre) {
        Swal.fire({
          title: 'Error',
          text: 'Por favor completa todos los campos obligatorios',
          icon: 'error'
        });
        return;
      }

      // Buscar programación correspondiente
      const programacion = programaciones.find(p => 
        p.ruta.toLowerCase().trim() === formData.ruta.toLowerCase().trim()
      );

      if (!programacion) {
        Swal.fire({
          title: 'Error',
          text: 'No se encontró una programación válida para la ruta: ' + formData.ruta,
          icon: 'error'
        });
        return;
      }

      // Normalizar tipo de unidad a MAYÚSCULAS (se admite ORION)
      const mapearTipoUnidad = (tipo) => String(tipo || '').trim().toUpperCase();

      // Preparar datos para crear la apertura
      const toHHmm = (val) => {
        if (!val) return '';
        const [h = '00', m = '00'] = String(val).split(':');
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      };

      const aperturaData = {
        programacionId: programacion._id,
        ruta: formData.ruta.trim(),
        tipoUnidad: mapearTipoUnidad(formData.tipoUnidad),
        economico: formData.economico.toString().trim().toUpperCase(),
        tarjeton: formData.tarjeton.toString().trim().toUpperCase(),
        nombre: formData.nombre.trim(),
        horaSalida: (() => {
          const now = new Date();
          console.log('📅 [INDIVIDUAL] Fecha completa:', now);
          console.log('🌍 [INDIVIDUAL] Zona horaria:', now.getTimezoneOffset(), 'minutos');
          console.log('📍 [INDIVIDUAL] Fecha ISO:', now.toISOString());
          console.log('📍 [INDIVIDUAL] Fecha local:', now.toLocaleString());
          
          const hours = now.getHours();
          const minutes = now.getMinutes();
          const seconds = now.getSeconds();
          
          console.log('⏰ [INDIVIDUAL] Hora raw:', hours, 'Minutos raw:', minutes, 'Segundos raw:', seconds);
          
          const hh = String(hours).padStart(2, '0');
          const mm = String(minutes).padStart(2, '0');
          const formatted = `${hh}:${mm}`;
          
          console.log('✅ [INDIVIDUAL] HORA FINAL GENERADA:', formatted);
          
          return formatted;
        })(), // Hora actual real
        horaProgramada: toHHmm(formData.horaSalida || programacion.horaSalida || '05:30'),
        intervalo: parseInt(formData.intervalo || programacion.intervalo || '15'),
        corridaInicial: parseInt(formData.corridaInicial || programacion.corridaInicial || '1'),
        corridaFinal: parseInt(formData.corridaFinal || programacion.corridaFinal || '1'),
         fechaApertura: new Date().toISOString(),
         estado: 'apertura',
        comentario: formData.comentario ? formData.comentario.trim() : '',
        observaciones: formData.comentario ? formData.comentario.trim() : '',
        usuarioCreacion: localStorage.getItem('userName') || 'sistema'
      };

      // Función para asegurar formato HH:mm
      const ensureHHmm = (timeStr) => {
        if (!timeStr) return '00:00';
        
        console.log('🔧 Normalizando hora (individual):', timeStr);
        
        // Limpiar la cadena y reemplazar caracteres problemáticos
        const cleanStr = String(timeStr).trim().replace(/[^\d:]/g, ''); // Solo dígitos y ':'
        const parts = cleanStr.split(':');
        
        let hours = parseInt(parts[0]) || 0;
        let minutes = parseInt(parts[1]) || 0;
        
        // Validar rangos
        if (hours < 0 || hours > 23) hours = 0;
        if (minutes < 0 || minutes > 59) minutes = 0;
        
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const result = `${hh}:${mm}`;
        
        console.log('🔧 Resultado normalizado (individual):', result);
        return result;
      };

      // Normalizar las horas antes de enviar
      aperturaData.horaSalida = ensureHHmm(aperturaData.horaSalida);
      aperturaData.horaProgramada = ensureHHmm(aperturaData.horaProgramada);

      console.log('🚀 Datos completos antes de enviar:', JSON.stringify(aperturaData, null, 2));
      console.log('🔍 Validando formato de hora:', {
        horaSalida: aperturaData.horaSalida,
        horaProgramada: aperturaData.horaProgramada,
        horaSalidaRegex: /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(aperturaData.horaSalida),
        horaProgramadaRegex: /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(aperturaData.horaProgramada)
      });

          // Crear la apertura en la base de datos
          await aperturaService.create(aperturaData);

      // Actualizar localStorage también
      const horariosGuardados = JSON.parse(localStorage.getItem('horariosActuales') || '[]');
      const horariosActualizados = horariosGuardados.map(h => {
        if (h.id === horarioId) {
          return {
            ...h,
            apertura: formData
          };
        }
        return h;
      });
      localStorage.setItem('horariosActuales', JSON.stringify(horariosActualizados));

      Swal.fire({
        title: '¡Éxito!',
        text: 'Apertura creada correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      navigateWithTransition('/horarios');
    } catch (error) {
      console.error('❌ Error al crear apertura:', error);
      console.error('❌ Mensaje de error:', error.message);
      console.error('❌ Datos que causaron el error:', aperturaData);
      
      let errorMessage = error.message || 'Error al crear la apertura';
      
      // Si el error es muy largo, truncarlo
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 200) + '...';
      }
      
      Swal.fire({
        title: 'Error al crear apertura',
        html: `
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Datos enviados:</strong></p>
          <pre style="font-size: 12px; text-align: left; max-height: 150px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">
${JSON.stringify(aperturaData, null, 2)}
          </pre>
        `,
        icon: 'error',
        width: '600px'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange llamado:', name, value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si se está cambiando el tarjetón, buscar el operador automáticamente
    if (name === 'tarjeton') {
      setOperadorEncontrado(false);
      setOperadorNoEncontrado(false);
      setFormData(prev => ({ ...prev, nombre: '' }));

      // Normalizar tarjetón: quitar espacios y poner en mayúsculas
      const tarjetonNormalizado = value.trim().toUpperCase().replace(/\s+/g, '');

      if (tarjetonNormalizado.length >= 3) {
        setBuscandoOperador(true);
        // Usar el servicio específico para buscar por tarjetón
        buscarOperadorPorTarjeton(tarjetonNormalizado);
      }
    }
  };



  // Función para buscar operador por tarjetón
  const buscarOperadorPorTarjeton = async (tarjeton) => {
    try {
      console.log('Buscando operador para tarjetón:', tarjeton);
      const operador = await operadorService.buscarPorTarjeton(tarjeton);
      console.log('Respuesta del servicio:', operador);

      if (operador && operador.nombre) {
        console.log('Autocompletando nombre:', operador.nombre);
        setFormData(prev => ({
          ...prev,
          nombre: operador.nombre
        }));
        setOperadorEncontrado(true);
        setOperadorNoEncontrado(false);

        // Mostrar mensaje de éxito más discreto
        Swal.fire({
          title: '✅ Operador encontrado',
          text: operador.nombre,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        console.log('Operador no encontrado o sin nombre');
        setOperadorNoEncontrado(true);
        setOperadorEncontrado(false);
      }
    } catch (error) {
      console.error('Error al buscar operador:', error);
      setOperadorNoEncontrado(true);
      setOperadorEncontrado(false);
      
      // Solo mostrar error si no es un 404 (operador no encontrado)
      if (error.message && !error.message.includes('404')) {
        Swal.fire({
          title: 'Error de conexión',
          text: 'Error al conectar con la base de datos',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } finally {
      setBuscandoOperador(false);
    }
  };

  // Funciones para importador masivo
  const handleFileUpload = (event) => {
    console.log('📁 ARCHIVO SELECCIONADO');
    const file = event.target.files[0];
    if (!file) {
      console.log('❌ No hay archivo seleccionado');
      return;
    }
    console.log('📄 Archivo:', file.name, 'Tamaño:', file.size);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Filtrar filas vacías, excluir encabezados y procesar datos
        const processedData = jsonData
          .filter(row => row.length > 0 && row.some(cell => cell && cell.toString().trim() !== ''))
          .filter(row => {
            // Excluir posibles filas de encabezado
            const c0 = String(row[0] || '').toLowerCase();
            const c2 = String(row[2] || '').toLowerCase();
            const c3 = String(row[3] || '').toLowerCase();
            const c4 = String(row[4] || '').toLowerCase();
            const looksHeader = c0.includes('tipo') || c2.includes('economico') || c3.includes('tarjeton') || c4.includes('nombre');
            if (looksHeader) return false;
            // Filtrar filas que contengan datos de unidades (tienen económico y tarjetón y nombre)
            const hasEconomico = row[2] && row[2].toString().trim() !== '';
            const hasTarjeton = row[3] && row[3].toString().trim() !== '';
            const hasNombre = row[4] && row[4].toString().trim() !== '';
            return hasEconomico && hasTarjeton && hasNombre;
          })
          .map(row => ({
            tipoUnidad: (row[0] || '').toLowerCase().trim(),
            ruta: (row[1] || '').toString().trim(),
            economico: (row[2] || '').toString().trim().toUpperCase(),
            tarjeton: (row[3] || '').toString().trim().toUpperCase(),
            nombre: (row[4] || '').toString().trim(),
            // Campos que se rellenarán automáticamente
            horaSalida: '',
            intervalo: '',
            corridaInicial: '',
            corridaFinal: '',
            fechaApertura: new Date().toISOString(),
            estado: 'apertura'
          }));

        console.log('📊 DATOS PROCESADOS:', processedData.length, 'elementos');
        console.log('📝 Primeros 3 elementos:', processedData.slice(0, 3));

        // Verificar que las rutas/tipos existan en programaciones
        const verifyRows = async (rows) => {
          // Preferir la función expuesta por App.jsx si existe
          if (window.verifyProgramacionRows && typeof window.verifyProgramacionRows === 'function') {
            try {
              return await window.verifyProgramacionRows(rows);
            } catch (err) {
              console.warn('verifyProgramacionRows fallo, usando verificación local:', err);
            }
          }

          // Verificación local como fallback
          const notFound = [];
          for (const row of rows) {
            const ruta = String(row.ruta || '').trim().toLowerCase();
            const tipo = String(row.tipoUnidad || '').trim().toUpperCase();

            const match = (programaciones || []).find(p => {
              if (!p || !p.ruta) return false;
              const pRuta = String(p.ruta || '').trim().toLowerCase();
              if (pRuta !== ruta) return false;
              if (!tipo) return true;
              const pTipo = String(p.tipoVehiculo || p.tipoUnidad || '').trim().toUpperCase();
              return pTipo === tipo;
            });

            if (!match) notFound.push(row);
          }

          return { ok: notFound.length === 0, notFound };
        };

        const verification = await verifyRows(processedData);
        if (!verification.ok) {
          console.log('⚠️ Se encontraron filas sin coincidencia, filtrando automáticamente...');
          
          // Filtrar automáticamente las filas no encontradas
          const notFoundSet = new Set(verification.notFound.map(nf => {
            const key = String(nf.ruta || '').trim().toLowerCase() + '||' + String(nf.tipo || '').trim().toUpperCase() + '||' + String(nf.numeroCorridas || '');
            return key;
          }));
          
          const filtered = processedData.filter(r => {
            const key = String(r.ruta || '').trim().toLowerCase() + '||' + String(r.tipoUnidad || r.TIPO || '').trim().toUpperCase() + '||' + String(parseInt(r.numeroCorridaInicial || r.corridaFinal || 0));
            return !notFoundSet.has(key);
          });

          if (filtered.length === 0) {
            Swal.fire({
              title: 'Sin datos válidos',
              html: `<p>Se encontraron <strong>${verification.notFound.length}</strong> filas que no coinciden con las programaciones.</p><p>No hay filas válidas para importar.</p>`,
              icon: 'warning'
            });
            return;
          }

          // Mostrar resumen de lo que se importará
          const skippedCount = verification.notFound.length;
          const ejemplosHtml = verification.notFound.slice(0, 10).map(nf => {
            const ruta = nf.ruta || nf.row?.ruta || '?';
            const tipo = (nf.tipo || nf.row?.tipoUnidad || '').toString();
            let reasonText = '';
            if (nf.reason === 'ruta_no_existente') reasonText = 'Ruta no encontrada';
            else if (nf.reason === 'tipo_no_coincide') reasonText = `Tipo no coincide`;
            else if (nf.reason === 'corridas_no_coinciden') reasonText = `Corridas no coinciden (esperadas: ${ (nf.availableCorridas || []).join(', ') }, recibidas: ${nf.numeroCorridas})`;
            else reasonText = 'No coincide';
            return `<li>${ruta}${tipo ? ` (${tipo})` : ''} — ${reasonText}</li>`;
          }).join('');

          Swal.fire({
            title: 'Importación automática filtrada',
            html: `
              <div style="text-align: left;">
                <p><strong>✅ Se importarán:</strong> ${filtered.length} registros válidos</p>
                <p><strong>⏭️ Se omitirán:</strong> ${skippedCount} registros con inconsistencias</p>
                <details style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                  <summary style="cursor: pointer; color: #6F2234; font-weight: bold;">Ver detalles de registros omitidos</summary>
                  <ul style="margin-top: 0.5rem; padding-left: 20px; font-size: 12px;">
                    ${ejemplosHtml}
                    ${verification.notFound.length > 10 ? `<li style="color: #999;">... y ${verification.notFound.length - 10} más</li>` : ''}
                  </ul>
                </details>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'Continuar importación'
          });

          setImportData(filtered);
          console.log(`🎭 Datos filtrados: ${filtered.length} válidos, ${skippedCount} omitidos`);
          setShowImportModal(true);
          return;
        }

        setImportData(processedData);
        console.log('🎭 MOSTRANDO MODAL DE IMPORTACIÓN');
        setShowImportModal(true);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al procesar el archivo Excel',
          icon: 'error'
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkImport = async () => {
    if (importData.length === 0) return;

    // Confirmar con el usuario antes de proceder
    const result = await Swal.fire({
      title: '⚠️ Confirmar Importación',
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Se van a importar ${importData.length} elementos.</strong></p>
          <p style="color: #dc3545;">⚠️ Esto eliminará todas las aperturas del día actual antes de importar las nuevas.</p>
          <p>¿Deseas continuar?</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6F2234',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, importar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    console.log('🚀 INICIANDO IMPORTACIÓN MASIVA');
    console.log('📊 Cantidad de elementos:', importData.length);
    console.log('⏰ Hora actual del sistema:', new Date().toLocaleString());

    setImporting(true);
    try {
      // Limpiar aperturas del día actual antes de importar
      const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('🧹 Limpiando aperturas del día:', fechaHoy);
      
      try {
        const deleteResponse = await aperturaService.deleteByDate(fechaHoy);
        console.log('✅ Limpieza completada:', deleteResponse);
      } catch (deleteError) {
        console.warn('⚠️ Error al limpiar (continuando):', deleteError.message);
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of importData) {
        try {
          // Buscar programación correspondiente para rellenar campos faltantes
          const programacion = programaciones.find(p => 
            (p.ruta || '').toLowerCase().trim() === (item.ruta || '').toLowerCase().trim() && 
            (p.tipoUnidad || p.tipoVehiculo || '').toLowerCase().trim() === (item.tipoUnidad || '').toLowerCase().trim()
          );

          const formatToHHmm = (val) => {
            if (!val || val === '' || val === null || val === undefined) {
              return '00:00'; // Valor por defecto válido
            }
            
            const cleanVal = String(val).trim();
            if (!cleanVal) return '00:00';
            
            const parts = cleanVal.split(':');
            const hh = String(parts[0] || '00').padStart(2, '0');
            const mm = String(parts[1] || '00').padStart(2, '0');
            
            // Validar que sean números válidos
            const hhNum = parseInt(hh);
            const mmNum = parseInt(mm);
            
            if (isNaN(hhNum) || isNaN(mmNum)) return '00:00';
            if (hhNum < 0 || hhNum > 23) return '00:00';
            if (mmNum < 0 || mmNum > 59) return '00:00';
            
            return `${hh}:${mm}`;
          };

          const getCurrentTimeFormatted = () => {
            const now = new Date();
            console.log('📅 Fecha completa:', now);
            console.log('🌍 Zona horaria:', now.getTimezoneOffset(), 'minutos');
            console.log('📍 Fecha ISO:', now.toISOString());
            console.log('📍 Fecha local:', now.toLocaleString());
            
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            console.log('⏰ Hora raw:', hours, 'Minutos raw:', minutes, 'Segundos raw:', seconds);
            
            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            const formatted = `${hh}:${mm}`;
            
            console.log('✅ HORA FINAL GENERADA:', formatted);
            
            return formatted;
          };

          const horaSalidaGenerada = getCurrentTimeFormatted();
          let horaProgramadaGenerada = formatToHHmm(item.horaSalida || programacion?.horaSalida || '05:30');
          
          // Asegurar que nunca esté vacío
          if (!horaProgramadaGenerada || horaProgramadaGenerada === '') {
            horaProgramadaGenerada = '05:30';
          }

          console.log('🕐 Hora de salida generada:', horaSalidaGenerada);
          console.log('🕐 Hora programada generada:', horaProgramadaGenerada);

          const aperturaData = {
            programacionId: programacion?._id || programacionPorRuta?._id || programaciones[0]?._id,
            ruta: (item.ruta || '').toString().trim(),
            tipoUnidad: (item.tipoUnidad || '').toString().trim().toUpperCase() === 'ORION' ? 'URBANO' : (item.tipoUnidad || '').toString().trim().toUpperCase(),
            economico: (item.economico || '').toString().trim().toUpperCase(),
            tarjeton: (item.tarjeton || '').toString().trim().toUpperCase(),
            nombre: (item.nombre || '').toString().trim(),
            horaSalida: horaSalidaGenerada, // Hora actual real
            horaProgramada: horaProgramadaGenerada,
            intervalo: parseInt(item.intervalo || programacion?.intervalo || '15'),
            corridaInicial: parseInt(item.corridaInicial || programacion?.corridaInicial || '1'),
            corridaFinal: parseInt(item.corridaFinal || programacion?.corridaFinal || '1'),
            fechaApertura: item.fechaApertura || new Date().toISOString(),
            estado: 'apertura',
            comentario: (item.comentario || '').toString().trim(),
            observaciones: (item.comentario || '').toString().trim(),
            usuarioCreacion: localStorage.getItem('userName') || 'sistema'
          };

          // Función para asegurar formato HH:mm
          const ensureHHmm = (timeStr) => {
            if (!timeStr) return '00:00';
            
            console.log('🔧 Normalizando hora (masivo):', timeStr);
            
            // Limpiar la cadena y reemplazar caracteres problemáticos
            const cleanStr = String(timeStr).trim().replace(/[^\d:]/g, ''); // Solo dígitos y ':'
            const parts = cleanStr.split(':');
            
            let hours = parseInt(parts[0]) || 0;
            let minutes = parseInt(parts[1]) || 0;
            
            // Validar rangos
            if (hours < 0 || hours > 23) hours = 0;
            if (minutes < 0 || minutes > 59) minutes = 0;
            
            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            const result = `${hh}:${mm}`;
            
            console.log('🔧 Resultado normalizado (masivo):', result);
            return result;
          };

          // Normalizar las horas antes de enviar
          aperturaData.horaSalida = ensureHHmm(aperturaData.horaSalida);
          aperturaData.horaProgramada = ensureHHmm(aperturaData.horaProgramada);

          console.log('📦 Importación masiva - Datos antes de enviar:', JSON.stringify(aperturaData, null, 2));
          console.log('🔍 Validando formato de horas en masivo:', {
            horaSalida: aperturaData.horaSalida,
            horaProgramada: aperturaData.horaProgramada,
            horaSalidaRegex: /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(aperturaData.horaSalida || ''),
            horaProgramadaRegex: /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(aperturaData.horaProgramada || '')
          });

          console.log('🌐 A PUNTO DE ENVIAR AL SERVIDOR:', {
            ruta: aperturaData.ruta,
            economico: aperturaData.economico,
            horaSalida: aperturaData.horaSalida,
            horaProgramada: aperturaData.horaProgramada
          });

          await aperturaService.create(aperturaData);
          successCount++;
        } catch (error) {
          console.error('❌ Error al crear apertura:', error);
          console.error('📋 Datos del elemento que falló:', {
            ruta: item.ruta,
            economico: item.economico,
            tarjeton: item.tarjeton,
            nombre: item.nombre
          });
          
          if (error.message.includes('tarjetón')) {
            console.warn('⚠️ Error de tarjetón duplicado para:', item.tarjeton);
          }
          
          errorCount++;
        }
      }

      Swal.fire({
        title: 'Importación completada',
        html: `
          <p>✅ <strong>${successCount}</strong> aperturas creadas exitosamente</p>
          ${errorCount > 0 ? `<p>❌ <strong>${errorCount}</strong> errores</p>` : ''}
        `,
        icon: 'success'
      });

      setShowImportModal(false);
      setImportData([]);
    } catch (error) {
      console.error('Error en importación masiva:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error durante la importación masiva',
        icon: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  const role = localStorage.getItem('userRole');

  if (!horario) {
    return (
      <div className="container">
        {role !== 'administrador' && <Navbar />}
        <main className="main-content">
          <div className="loading">Cargando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      {role !== 'administrador' && <Navbar />}
      <main className="main-content">
        <div className="apertura-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: '7rem', textAlign: 'center', fontWeight: 'bold', color: '#6F2234', fontSize: '2rem', letterSpacing: '0.5px' }}>Asignación de Unidad</h2>
          <div className="horario-info" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <p><strong>Ruta:</strong> {horario.ruta}</p>
            <p><strong>Fecha:</strong> {horario.fecha}</p>
            <p><strong>Hora de salida:</strong> {horario.horaSalida}</p>
          </div>
        </div>
        {/* Botón de importación masiva */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              background: '#6F2234',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            📊 Cargar Excel Masivo
          </button>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            Sube un archivo Excel con las programaciones diarias
          </p>
        </div>

        <form onSubmit={handleSubmit} className="apertura-form modern-form" style={{ width: '100%', maxWidth: 700, margin: '0 auto 2rem auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2.5rem', justifyContent: 'center' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Nueva Programación</h2>
          <div className="form-grid-2col apertura-form-grid">
            <div className="form-group">
              <label htmlFor="ruta">Ruta:</label>
              <input type="text" id="ruta" name="ruta" value={formData.ruta} onChange={handleChange} required placeholder="Ej: Ruta 1" />
            </div>
            <div className="form-group">
              <label htmlFor="tipoUnidad">Tipo de Unidad:</label>
              <select id="tipoUnidad" name="tipoUnidad" value={formData.tipoUnidad} onChange={handleChange} required>
                <option value="">Seleccione tipo de unidad</option>
                <option value="URBANO">URBANO</option>
                <option value="SUBURBANO">SUBURBANO</option>
                <option value="INTERMUNICIPAL">INTERMUNICIPAL</option>
                <option value="GRAN VIALE">GRAN VIALE</option>
                <option value="BOXER">BOXER</option>
                <option value="SPRINTER">SPRINTER</option>
                <option value="VAGONETA">VAGONETA</option>
                <option value="ORION">ORION</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="intervalo">Intervalo:</label>
              <input type="number" id="intervalo" name="intervalo" value={formData.intervalo} onChange={handleChange} required placeholder="Intervalo" />
            </div>
            <div className="form-group">
              <label htmlFor="corridaInicial">Corrida Inicial:</label>
              <input type="number" id="corridaInicial" name="corridaInicial" value={formData.corridaInicial} onChange={handleChange} required placeholder="Corrida Inicial" />
            </div>
            <div className="form-group">
              <label htmlFor="corridaFinal">Corrida Final:</label>
              <input type="number" id="corridaFinal" name="corridaFinal" value={formData.corridaFinal} onChange={handleChange} required placeholder="Corrida Final" />
            </div>
            <div className="form-group">
              <label htmlFor="horaSalida">Hora de Salida:</label>
              <input type="text" id="horaSalida" name="horaSalida" value={formData.horaSalida} onChange={handleChange} required placeholder="Hora de salida" />
            </div>
            <div className="form-group">
              <label htmlFor="economico">Número Económico:</label>
              <input type="text" id="economico" name="economico" value={formData.economico} onChange={handleChange} required placeholder="Número económico de la unidad" />
            </div>
            <div className="form-group">
              <label htmlFor="tarjeton">Tarjetón:</label>
              <input
                type="text"
                id="tarjeton"
                name="tarjeton"
                value={formData.tarjeton || ''}
                onChange={handleChange}
                required
                placeholder="Número de tarjetón"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                data-testid="tarjeton-input"
              />
              {buscandoOperador && (
                <small style={{ color: '#007bff', display: 'block', marginTop: '4px' }}>
                  🔍 Buscando operador...
                </small>
              )}
            </div>
            {/* Agrupar operador y comentario en el mismo div para alinearlos */}
            <div className="form-group" style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="nombre">Nombre del Operador:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  readOnly
                  placeholder="Se autocompletará al ingresar el tarjetón"
                  style={{
                    backgroundColor: operadorEncontrado ? '#e8f5e8' : '#f5f5f5',
                    cursor: 'not-allowed',
                    border: operadorEncontrado ? '1px solid #28a745' : '1px solid #ccc'
                  }}
                />
                {operadorNoEncontrado && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '4px' }}>
                    ❌ Usuario no encontrado
                  </small>
                )}
                {operadorEncontrado && (
                  <small style={{ color: '#28a745', display: 'block', marginTop: '4px' }}>
                    ✅ Operador encontrado
                  </small>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="comentario">Comentario:</label>
                <textarea id="comentario" name="comentario" value={formData.comentario} onChange={handleChange} placeholder="Comentario opcional" rows={2} style={{ resize: 'vertical', width: '100%' }} />
              </div>
            </div>
          </div>
          <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-apertura">SUBIR</button>
          </div>
        </form>

        {/* Modal de previsualización de importación masiva */}
        {showImportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ color: '#6F2234', marginBottom: '1rem', textAlign: 'center' }}>
                📊 Previsualización de Importación Masiva
              </h3>
              <p style={{ marginBottom: '1rem', textAlign: 'center', color: '#666' }}>
                Se encontraron <strong>{importData.length}</strong> unidades para importar
              </p>
              
              {/* Tabla de previsualización */}
              <div style={{ marginBottom: '1.5rem', maxHeight: '400px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#6F2234', color: 'white' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Ruta</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Económico</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tarjetón</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((item, index) => (
                      <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.tipoUnidad}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.ruta}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.economico}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.tarjeton}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importData.length > 10 && (
                  <p style={{ textAlign: 'center', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                    ... y {importData.length - 10} unidades más
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowImportModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    console.log('🔥 BOTÓN IMPORTAR CLICKEADO');
                    handleBulkImport();
                  }}
                  disabled={importing}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    background: importing ? '#ccc' : '#6F2234',
                    color: 'white',
                    cursor: importing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {importing ? 'Importando...' : 'Confirmar Importación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Apertura;