import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { aperturaService, programacionService } from '../services/api';
import '../Apertura.css';
import { useLocation } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import DashboardCharts from './DashboardCharts';
import { Bar, Pie } from 'react-chartjs-2';

// Import images for PDF generation
import granVialeImg from '../assets/gran_viale.png';
import boxerImg from '../assets/boxer.png';
import sprinterImg from '../assets/sprinter.png';
import vagonetaImg from '../assets/vagoneta.png';
import orionImg from '../assets/orion.png';



function Dashboard() {
  const [aperturas, setAperturas] = useState([]);
  const [programaciones, setProgramaciones] = useState([]);
  const [verificados, setVerificados] = useState([]);
  const [tab, setTab] = useState('programador');

  // Estado para filtro de fecha por sección y tablas
  const [fechaFiltroProgramador, setFechaFiltroProgramador] = useState('');
  const [fechaFiltroApertura, setFechaFiltroApertura] = useState('');
  const [fechaFiltroVerificados, setFechaFiltroVerificados] = useState('');
  const [fechaFiltroTablaProgramador, setFechaFiltroTablaProgramador] = useState('');
  const [fechaFiltroTablaVerificados, setFechaFiltroTablaVerificados] = useState('');

  // Estado para filtro de semana por sección
  const [semanaFiltroProgramador, setSemanaFiltroProgramador] = useState('');
  const [semanaFiltroVerificados, setSemanaFiltroVerificados] = useState('');

  // Estado para filtro de mes por sección
  const [mesFiltroProgramador, setMesFiltroProgramador] = useState('');
  const [mesFiltroVerificados, setMesFiltroVerificados] = useState('');

  // Estado para filtro de mes, semana y fecha de la tabla de aperturas
  const [mesFiltroAperturaTabla, setMesFiltroAperturaTabla] = useState('');
  const [semanaFiltroAperturaTabla, setSemanaFiltroAperturaTabla] = useState('');
  const [fechaFiltroAperturaTabla, setFechaFiltroAperturaTabla] = useState('');

  const role = localStorage.getItem('userRole');
  const [flashId, setFlashId] = useState(() => localStorage.getItem('flashAperturaId') || null);

  useEffect(() => {
    cargarDatos();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Dashboard auto-refresh');
      cargarDatos();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (flashId) {
      setTimeout(() => {
        setFlashId(null);
        localStorage.removeItem('flashAperturaId');
      }, 5000);
    }
  }, [flashId]);

  const cargarDatos = async () => {
    try {
      const aperturasData = await aperturaService.getAll();
      setAperturas(aperturasData);
      // Mostrar solo verificados (aprobados/rechazados): 'dashboard' y 'cancelado'
      setVerificados(aperturasData.filter(ap => ap.estado === 'dashboard' || ap.estado === 'cancelado'));
      if (programacionService && programacionService.getAll) {
        const programacionesData = await programacionService.getAll();
        setProgramaciones(programacionesData);
      }
    } catch (error) {
      // Manejo de error simple
      alert('Error al cargar los datos');
    }
  };

  // Función para eliminar una apertura
  const handleDeleteApertura = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta apertura? Esta acción no se puede deshacer.')) {
      try {
        await aperturaService.delete(id);
        // Recargar datos después de eliminar
        cargarDatos();
        alert('Apertura eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar apertura:', error);
        alert('Error al eliminar la apertura');
      }
    }
  };

  // Función para eliminar una programación
  const handleDeleteProgramacion = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta programación? Esta acción no se puede deshacer.')) {
      try {
        await programacionService.delete(id);
        // Recargar datos después de eliminar
        cargarDatos();
        alert('Programación eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar programación:', error);
        alert('Error al eliminar la programación');
      }
    }
  };

  // Datos para gráficas individuales
  const chartData = {
    programaciones: {
      labels: programaciones.map(p => p.ruta),
      datasets: [{
        label: 'Programaciones',
        data: programaciones.map(() => 1),
        backgroundColor: '#6F2234',
      }],
    },
    aperturas: {
      labels: aperturas.map(a => a.ruta),
      datasets: [{
        label: 'Aperturas',
        data: aperturas.map(() => 1),
        backgroundColor: '#B23A48',
      }],
    },
    verificados: {
      labels: verificados.map(v => v.ruta),
      datasets: [{
        label: 'Verificaciones',
        data: verificados.map(() => 1),
        backgroundColor: '#F46036',
      }],
    },
  };

  // Agrupar por fecha para cada tipo
  function agruparPorFecha(arr, campoFecha) {
    return arr.reduce((acc, item) => {
      const fecha = item[campoFecha] ? new Date(item[campoFecha]).toLocaleDateString() : 'Sin fecha';
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(item);
      return acc;
    }, {});
  }

  // Agrupar por fecha de aprobación/envío (ultimaModificacion.fecha o updatedAt)
  function agruparPorFechaAprobacion(arr) {
    return arr.reduce((acc, item) => {
      const fecha = item.ultimaModificacion?.fecha || item.updatedAt || item.createdAt;
      const fechaStr = fecha ? new Date(fecha).toLocaleDateString() : 'Sin fecha';
      if (!acc[fechaStr]) acc[fechaStr] = [];
      acc[fechaStr].push(item);
      return acc;
    }, {});
  }

  const programacionesPorFecha = agruparPorFecha(programaciones, 'fechaCreacion');
  const aperturasPorFecha = agruparPorFecha(aperturas, 'fechaApertura');
  const verificadosPorFecha = agruparPorFecha(verificados, 'fechaApertura');

  // Función para obtener el número de semana y año de una fecha
  function getWeekYear(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  // Obtener semanas únicas para programaciones y verificados
  const semanasProgramaciones = [...new Set(programaciones.filter(p => p.fechaCreacion).map(p => getWeekYear(p.fechaCreacion)))];
  const semanasVerificados = [...new Set(verificados.filter(v => v.fechaApertura).map(v => getWeekYear(v.fechaApertura)))];

  // Filtrar programaciones y verificados por semana seleccionada
  const programacionesFiltradasSemana = semanaFiltroProgramador
    ? programaciones.filter(p => getWeekYear(p.fechaCreacion) === semanaFiltroProgramador)
    : programaciones;
  const verificadosFiltradosSemana = semanaFiltroVerificados
    ? verificados.filter(v => getWeekYear(v.fechaApertura) === semanaFiltroVerificados)
    : verificados;

  // Función para obtener el mes y año de una fecha (formato YYYY-MM)
  function getMonthYear(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  // Obtener meses únicos para programaciones y verificados
  const mesesProgramaciones = [...new Set(programaciones.filter(p => p.fechaCreacion).map(p => getMonthYear(p.fechaCreacion)))];
  const mesesVerificados = [...new Set(verificados.filter(v => v.fechaApertura).map(v => getMonthYear(v.fechaApertura)))];

  // Filtrar programaciones y verificados por mes seleccionado
  const programacionesFiltradasMes = mesFiltroProgramador
    ? programaciones.filter(p => getMonthYear(p.fechaCreacion) === mesFiltroProgramador)
    : programaciones;
  const verificadosFiltradosMes = mesFiltroVerificados
    ? verificados.filter(v => getMonthYear(v.fechaApertura) === mesFiltroVerificados)
    : verificados;
  // --- FUNCIONES PARA PDF ACUSE ---
  // Acuse para tabla de programador por fecha (todas las tablas en la misma página)
  const handleAcuseProgramadorPorFecha = (fecha, items) => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'letter', unit: 'mm' });
    doc.setFontSize(16);
    doc.text('ACUSE DE PROGRAMACIONES VERIFICADAS', 14, 18);
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, 14, 26);
    doc.text(`Fecha de la tabla: ${fecha}`, 14, 34);
    let lastY = 40;
    // Tabla principal: Programaciones
    const head = [[
      'Ruta',
      'Tipo Unidad',
      'Corrida Inicial',
      'Corrida Final',
      'Hora Salida',
    ]];
    let rows = items.map(pr => [
      pr.ruta,
      pr.tipoUnidad || pr.tipoVehiculo,
      pr.corridaInicial,
      pr.corridaFinal,
      pr.horaSalida
    ]);
    autoTable(doc, {
      head,
      body: rows,
      startY: lastY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [111, 34, 52] },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        lastY = data.cursor.y + 10;
      }
    });

    // Tabla especial: Resumen por tipo de unidad
    const tiposUnidades = ['gran viale', 'boxer', 'sprinter', 'vagoneta'];
    // Filtrar programaciones de la fecha actual
    const programacionesDeFecha = items;
    // Unidades programadas por tipo
    const unidadesProgramadas = tipo => programacionesDeFecha.filter(p => (p.tipoUnidad || p.tipoVehiculo || '').toLowerCase() === tipo).length;
    // Filtrar verificados de la fecha actual
    const verificadosDeFechaResumen = verificados.filter(v => {
      const fechaV = v.fechaApertura ? new Date(v.fechaApertura).toLocaleDateString() : 'Sin fecha';
      return fechaV === fecha;
    });
    // Unidades en operación: verificados con estado 'dashboard' por tipo
    const unidadesEnOperacion = tipo => verificadosDeFechaResumen.filter(v => (v.tipoUnidad || v.tipoVehiculo || '').toLowerCase() === tipo && v.estado === 'dashboard').length;
    // Unidades en reserva: verificados con estado 'pendiente' por tipo
    const unidadesEnReserva = tipo => verificadosDeFechaResumen.filter(v => (v.tipoUnidad || v.tipoVehiculo || '').toLowerCase() === tipo && v.estado === 'pendiente').length;
    // Unidades en falla (pendiente) por tipo (igual que reserva, pero puedes cambiar la lógica si lo necesitas)
    const aperturasDeFecha = aperturas.filter(a => {
      const fechaA = a.fechaApertura ? new Date(a.fechaApertura).toLocaleDateString() : 'Sin fecha';
      return fechaA === fecha;
    });
    const unidadesEnFalla = tipo => aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase() === tipo && a.estado === 'pendiente').length;
    const headResumen = [[
      'Modelo',
      'Unidades Programadas',
      'Unidades en Operación',
      'Unidades en Reserva',
      'Unidades con Fallas',
    ]];
    const rowsResumen = tiposUnidades.map(tipo => [
      tipo.charAt(0).toUpperCase() + tipo.slice(1),
      unidadesProgramadas(tipo),
      unidadesEnOperacion(tipo),
      unidadesEnReserva(tipo),
      unidadesEnFalla(tipo)
    ]);
    doc.setFontSize(14);
    doc.text('Resumen por tipo de unidad', 10, lastY);
    lastY += 4;
    autoTable(doc, {
      head: headResumen,
      body: rowsResumen,
      startY: lastY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 180, 255] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        lastY = data.cursor.y + 10;
      }
    });

    // Tabla secundaria: Verificaciones de la misma fecha
    const verificadosDeFecha = verificados.filter(v => {
      const fechaV = v.fechaApertura ? new Date(v.fechaApertura).toLocaleDateString() : 'Sin fecha';
      return fechaV === fecha;
    });
    if (verificadosDeFecha.length > 0) {
      doc.setFontSize(14);
      doc.text('Verificaciones de la misma fecha', 14, lastY);
      lastY += 6;
      const headVer = [[
        'Ruta', 'Tipo Unidad', 'Económico', 'Tarjetón', 'Nombre', 'Corrida Inicial', 'Corrida Final', 'Hora Salida', 'Fecha Apertura', 'Estado', 'Motivo'
      ]];
      const rowsVer = verificadosDeFecha.map(ap => [
        ap.ruta,
        ap.tipoUnidad,
        ap.economico,
        ap.tarjeton,
        ap.nombre,
        ap.corridaInicial,
        ap.corridaFinal,
        ap.horaSalida,
        ap.fechaApertura ? new Date(ap.fechaApertura).toLocaleString('es-MX') : '-',
        ap.estado === 'cancelado' ? 'rechazado' : (ap.estado === 'completado') ? 'aceptado' : 'pendiente',
        ap.observaciones || '-'
      ]);
      autoTable(doc, {
        head: headVer,
        body: rowsVer,
        startY: lastY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [180, 58, 72] },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        didDrawPage: (data) => {
          lastY = data.cursor.y + 10;
        }
      });
    }

    // Tabla secundaria: Aperturas de la misma fecha
    if (aperturasDeFecha.length > 0) {
      doc.setFontSize(14);
      doc.text('Aperturas de la misma fecha', 14, lastY);
      lastY += 6;
      const headAp = [[
        'Ruta', 'Tipo Unidad', 'Económico', 'Tarjetón', 'Nombre', 'Corrida Inicial', 'Corrida Final', 'Hora Salida', 'Fecha Creación', 'Estado'
      ]];
      const rowsAp = aperturasDeFecha.map(ap => [
        ap.ruta,
        ap.tipoUnidad,
        ap.economico,
        ap.tarjeton,
        ap.nombre,
        ap.corridaInicial,
        ap.corridaFinal,
        ap.horaSalida,
        ap.createdAt ? new Date(ap.createdAt).toLocaleString('es-MX') : '-',
        ap.estado === 'cancelado' ? 'rechazado' : (ap.estado === 'completado') ? 'aceptado' : 'pendiente'
      ]);
      autoTable(doc, {
        head: headAp,
        body: rowsAp,
        startY: lastY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [244, 96, 54] },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        didDrawPage: (data) => {
          lastY = data.cursor.y + 10;
        }
      });
    }
    doc.save(`acuse_programaciones_${fecha.replace(/\//g, '-')}.pdf`);
  };

  // Helper function to convert image URL to Base64
  const imageUrlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  };

  const handleAcuseVerificacionesPorFecha = async (fecha, items) => {
    // Función para parsear fecha DD/MM/YYYY o ISO de forma confiable
    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      // Si es formato DD/MM/YYYY
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY -> YYYY-MM-DD para crear Date object
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      
      // Si es formato ISO (YYYY-MM-DD) o cualquier otro formato
      return new Date(dateString);
    };

    const doc = new jsPDF({ orientation: 'portrait', format: 'letter', unit: 'mm' });
    doc.setFontSize(16);
    doc.text('ACUSE DE VERIFICACIONES', 12, 14);
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`, 12, 20);
    doc.text(`Fecha de la tabla: ${fecha}`, 12, 27);
    let lastY = 30;

    // Parsear la fecha de filtro una sola vez
    const fechaFiltro = parseDate(fecha);
    if (!fechaFiltro) {
      alert('Error al procesar la fecha');
      return;
    }

    // Eliminamos la tabla detallada por elemento; usaremos solo el resumen visual con imágenes

    // --- NUEVO RESUMEN VISUAL POR MODELO ---
    const modelos = [
      {
        nombre: 'GRAN VIALE',
        tipo: 'gran viale',
        img: granVialeImg,
        fallas: (aperturasDeFecha) => {
          // Solo mostrar unidades regresadas (con observaciones de regreso)
          const arr = aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === 'gran viale' && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR'));
          if (arr.length === 0) return 'Ninguna';
          return arr.map(a => {
            const economico = a.economico || '';
            let tipoFalla = '';
            if (a.observaciones && a.observaciones.includes('REGRESO POR FALLA TÉCNICA:')) {
              tipoFalla = a.observaciones.split('REGRESO POR FALLA TÉCNICA:')[1]?.trim() || '';
            }
            return tipoFalla ? `${economico} (${tipoFalla})` : economico;
          }).join(', ');
        }
      },
      {
        nombre: 'BÓXER',
        tipo: 'boxer',
        img: boxerImg,
        fallas: (aperturasDeFecha) => {
          const arr = aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === 'boxer' && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR'));
          if (arr.length === 0) return 'Ninguna';
          return arr.map(a => {
            const economico = a.economico || '';
            let tipoFalla = '';
            if (a.observaciones && a.observaciones.includes('REGRESO POR FALLA TÉCNICA:')) {
              tipoFalla = a.observaciones.split('REGRESO POR FALLA TÉCNICA:')[1]?.trim() || '';
            }
            return tipoFalla ? `${economico} (${tipoFalla})` : economico;
          }).join(', ');
        }
      },
      {
        nombre: 'SPRINTER',
        tipo: 'sprinter',
        img: sprinterImg,
        fallas: (aperturasDeFecha) => {
          const arr = aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === 'sprinter' && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR'));
          if (arr.length === 0) return 'Ninguna';
          return arr.map(a => {
            const economico = a.economico || '';
            let tipoFalla = '';
            if (a.observaciones && a.observaciones.includes('REGRESO POR FALLA TÉCNICA:')) {
              tipoFalla = a.observaciones.split('REGRESO POR FALLA TÉCNICA:')[1]?.trim() || '';
            }
            return tipoFalla ? `${economico} (${tipoFalla})` : economico;
          }).join(', ');
        }
      },
      {
        nombre: 'VAGONETA',
        tipo: 'vagoneta',
        img: vagonetaImg,
        fallas: (aperturasDeFecha) => {
          const arr = aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === 'vagoneta' && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR'));
          if (arr.length === 0) return 'Ninguna';
          return arr.map(a => {
            const economico = a.economico || '';
            let tipoFalla = '';
            if (a.observaciones && a.observaciones.includes('REGRESO POR FALLA TÉCNICA:')) {
              tipoFalla = a.observaciones.split('REGRESO POR FALLA TÉCNICA:')[1]?.trim() || '';
            }
            return tipoFalla ? `${economico} (${tipoFalla})` : economico;
          }).join(', ');
        }
      },
      {
        nombre: 'ORIÓN',
        tipo: 'orion',
        img: orionImg,
        fallas: (aperturasDeFecha) => {
          const arr = aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === 'orion' && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR'));
          if (arr.length === 0) return 'Ninguna';
          return arr.map(a => {
            const economico = a.economico || '';
            let tipoFalla = '';
            if (a.observaciones && a.observaciones.includes('REGRESO POR FALLA TÉCNICA:')) {
              tipoFalla = a.observaciones.split('REGRESO POR FALLA TÉCNICA:')[1]?.trim() || '';
            }
            return tipoFalla ? `${economico} (${tipoFalla})` : economico;
          }).join(', ');
        }
      },
    ];

    // Filtrar programaciones, verificados y aperturas de la fecha actual
    const programacionesDeFecha = programaciones.filter(p => {
      if (!p.fechaCreacion) return false;
      const fechaP = parseDate(p.fechaCreacion);
      if (!fechaP) return false;
      return fechaP.getFullYear() === fechaFiltro.getFullYear() &&
             fechaP.getMonth() === fechaFiltro.getMonth() &&
             fechaP.getDate() === fechaFiltro.getDate();
    });
    const verificadosDeFechaResumen = verificados.filter(v => {
      if (!v.fechaApertura) return false;
      const fechaV = parseDate(v.fechaApertura);
      if (!fechaV) return false;
      return fechaV.getFullYear() === fechaFiltro.getFullYear() &&
             fechaV.getMonth() === fechaFiltro.getMonth() &&
             fechaV.getDate() === fechaFiltro.getDate();
    });
    const aperturasDeFecha = aperturas.filter(a => {
      if (!a.fechaApertura) return false;
      const fechaA = parseDate(a.fechaApertura);
      if (!fechaA) return false;
      return fechaA.getFullYear() === fechaFiltro.getFullYear() &&
             fechaA.getMonth() === fechaFiltro.getMonth() &&
             fechaA.getDate() === fechaFiltro.getDate();
    });

    // Funciones de conteo
  // Unidades programadas: solo las programadas en programador.jsx
  const unidadesProgramadas = tipo => programacionesDeFecha.filter(p => (p.tipoUnidad || p.tipoVehiculo || '').toLowerCase().trim() === tipo).length;
  // Unidades en operación: solo las aprobadas en verificador.jsx (estado 'dashboard' o 'completado')
  const unidadesEnOperacion = tipo => aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === tipo && (a.estado === 'dashboard' || a.estado === 'completado')).length;
  // Unidades en reserva: solo las que están en pendientes.jsx (estado 'pendiente' y NO tienen observaciones de regreso)
  const unidadesEnReserva = tipo => aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === tipo && a.estado === 'pendiente' && (!a.observaciones || !a.observaciones.toUpperCase().includes('REGRESO POR'))).length;
  // Unidades con falla: solo las que fueron regresadas desde historialverificador.jsx a pendientes.jsx (estado 'pendiente' y observaciones de regreso)
  const unidadesEnFalla = tipo => aperturasDeFecha.filter(a => (a.tipoUnidad || a.tipoVehiculo || '').toLowerCase().trim() === tipo && a.estado === 'pendiente' && a.observaciones && a.observaciones.toUpperCase().includes('REGRESO POR')).length;

    // Convert all images to Base64
    const imageData = await Promise.all(modelos.map(async (m) => {
      const imgBase64 = await imageUrlToBase64(m.img);
      return { text: m.nombre, img: imgBase64 };
    }));

    // Calcular totales
    const totalProgramadas = modelos.reduce((sum, m) => sum + unidadesProgramadas(m.tipo), 0);
    const totalOperacion = modelos.reduce((sum, m) => sum + unidadesEnOperacion(m.tipo), 0);
    const totalReserva = modelos.reduce((sum, m) => sum + unidadesEnReserva(m.tipo), 0);
    const totalFallas = modelos.reduce((sum, m) => sum + unidadesEnFalla(m.tipo), 0);

    // Encabezados y filas para la tabla visual
    const headResumen = [[
      'MODELO',
      'UNIDADES PROGRAMADAS',
      'UNIDADES EN OPERACIÓN',
      'UNIDADES EN RESERVA',
      'UNIDADES CON FALLA',
      'TIPO DE FALLA',
    ]];
    
    // Filas de datos
    const rowsResumen = modelos.map((m) => [
      '', // Empty string for first column - didDrawCell will handle the content
      unidadesProgramadas(m.tipo),
      unidadesEnOperacion(m.tipo),
      unidadesEnReserva(m.tipo),
      unidadesEnFalla(m.tipo),
      m.fallas(aperturasDeFecha)
    ]);

    // Agregar fila de totales con formato descriptivo
    rowsResumen.push([
      'TOTALES',
      `${totalProgramadas} UNIDADES PROGRAMADAS`,
      `${totalOperacion} UNIDADES EN OPERACIÓN`,
      `${totalReserva} UNIDADES EN RESERVA`,
      `${totalFallas} UNIDADES CON FALLA`,
      totalFallas > 0 ? `${totalFallas} UNIDADES` : 'Ninguna'
    ]);

    doc.setFontSize(14);
    doc.text('Resumen por tipo de unidad', 10, lastY);
    lastY += 4;

    // Renderizar tabla con imágenes
    autoTable(doc, {
      head: headResumen,
      body: rowsResumen,
      startY: lastY,
      styles: { fontSize: 9, cellPadding: 1.2, valign: 'middle', halign: 'center' },
      headStyles: { fillColor: [111, 34, 52], textColor: 255, fontStyle: 'bold' }, // Encabezados vino por defecto
      bodyStyles: { fontSize: 9, minCellHeight: 18 },
      columnStyles: {
        0: { cellWidth: 24, minCellHeight: 24 },
        1: { cellWidth: 24 },
        2: { cellWidth: 24 },
        3: { cellWidth: 24 },
        4: { cellWidth: 24 }, // UNIDADES CON FALLA - blanco
        5: { cellWidth: 62, halign: 'center' }, // TIPO DE FALLA - blanco
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      didDrawCell: (data) => {
        // Colorear encabezados de UNIDADES CON FALLA y TIPO DE FALLA en dorado
        if (data.row.section === 'head' && (data.column.index === 4 || data.column.index === 5)) {
          doc.setFillColor(203, 178, 106); // Color dorado (#CBB26A)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(0, 0, 0); // Texto negro
          doc.setFontSize(10);
          doc.setFont(doc.getFont().fontName, 'bold');
          doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, { align: 'center' });
        }

        // Draw vehicle images and names in body rows
        if (data.row.section === 'body' && data.column.index === 0 && data.row.index < imageData.length) {
          const imgInfo = imageData[data.row.index];
          if (imgInfo && imgInfo.img) {
            try {
              // Draw image at the top of the cell
              const imgWidth = 16;
              const imgHeight = 16;
              const x = data.cell.x + (data.cell.width - imgWidth) / 2;
              const y = data.cell.y + 2; // Position image at top with small margin
              doc.addImage(imgInfo.img, 'PNG', x, y, imgWidth, imgHeight);
              
              // Draw vehicle name below the image
              if (imgInfo.text) {
                doc.setFontSize(7.5);
                doc.setTextColor(0, 0, 0);
                const textX = data.cell.x + data.cell.width / 2;
                const textY = data.cell.y + imgHeight + 7; // Position text below image
                doc.text(imgInfo.text, textX, textY, { align: 'center' });
              }
            } catch (error) {
              console.error('Error drawing image or text:', error);
            }
          }
        }
        
        // Formato especial para la fila de TOTALES
        if (data.row.section === 'body' && data.row.index === modelos.length) {
          // Fondo blanco para toda la fila (no vino)
          doc.setFillColor(255, 255, 255);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Texto en negro y negrita
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
          doc.setFont(doc.getFont().fontName, 'bold');
          
          // Mostrar el texto descriptivo completo
          doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 3, { align: 'center' });
          
          // Reset font style
          doc.setFont(doc.getFont().fontName, 'normal');
        }
      },
      didDrawPage: (data) => {
        lastY = data.cursor.y + 10;
      }
    });

    doc.save(`acuse_verificaciones_${fecha.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="apertura-page" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Mostrar SIEMPRE el navbar de dashboard si el usuario es administrador */}
      {/* Mostrar el navbar de dashboard sin el apartado de componentes verificados */}
      <DashboardNavbar tab={tab} setTab={setTab} hideComponentes />
      <main className="apertura-content" style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        {tab === 'programador' && (
          <>
            <h2 style={{ color: '#6F2234', textAlign: 'center', marginTop: '2rem' }}>Gráficas de Programaciones</h2>
            {/* Filtro de mes para gráficas de fechas */}
            {mesesProgramaciones.length > 1 && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <select value={mesFiltroProgramador} onChange={e => setMesFiltroProgramador(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}>
                  <option value="">Todos los meses</option>
                  {mesesProgramaciones.sort().reverse().map(mes => (
                    <option key={mes} value={mes}>{mes}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Filtro de semana para gráficas de fechas */}
            {semanasProgramaciones.length > 1 && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <select value={semanaFiltroProgramador} onChange={e => setSemanaFiltroProgramador(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111' }}>
                  <option value="">Todas las semanas</option>
                  {semanasProgramaciones.sort().reverse().map(semana => (
                    <option key={semana} value={semana}>{semana}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
              {/* Gráfica por tipo de unidad */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Programaciones por Tipo Unidad</h3>
                <Bar data={{
                  labels: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.tipoUnidad || p.tipoVehiculo || 'Sin tipo'))],
                  datasets: [{
                    label: 'Cantidad',
                    data: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.tipoUnidad || p.tipoVehiculo || 'Sin tipo'))].map(tipo => (semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).filter(p => (p.tipoUnidad || p.tipoVehiculo || 'Sin tipo') === tipo).length),
                    backgroundColor: '#6F2234',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              {/* Gráfica por ruta */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Programaciones por Ruta</h3>
                <Bar data={{
                  labels: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.ruta))],
                  datasets: [{
                    label: 'Cantidad',
                    data: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.ruta))].map(ruta => (semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).filter(p => p.ruta === ruta).length),
                    backgroundColor: '#B23A48',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              {/* NUEVA: Programaciones por Hora de Salida */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Programaciones por Hora de Salida</h3>
                <Bar data={{
                  labels: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.horaSalida || 'Sin hora'))],
                  datasets: [{
                    label: 'Cantidad',
                    data: [...new Set((semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).map(p => p.horaSalida || 'Sin hora'))].map(hora => (semanaFiltroProgramador ? programacionesFiltradasSemana : programacionesFiltradasMes).filter(p => (p.horaSalida || 'Sin hora') === hora).length),
                    backgroundColor: '#F7B801',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </>
        )}
        {tab === 'apertura' && (
          <>
            <h2 style={{ color: '#6F2234', textAlign: 'center', marginTop: '2rem' }}>Gráficas de Aperturas</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
              {/* Gráfica por estado */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Aperturas por Estado</h3>
                <Pie data={{
                  labels: [...new Set(aperturas.map(a => a.estado))],
                  datasets: [{
                    data: [...new Set(aperturas.map(a => a.estado))].map(estado => aperturas.filter(a => a.estado === estado).length),
                    backgroundColor: ['#6F2234', '#B23A48', '#F46036', '#F7B801', '#2E294E'],
                  }],
                }} options={{ responsive: true }} />
              </div>
              {/* Gráfica por ruta */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Aperturas por Ruta</h3>
                <Bar data={{
                  labels: [...new Set(aperturas.map(a => a.ruta))],
                  datasets: [{
                    label: 'Cantidad',
                    data: [...new Set(aperturas.map(a => a.ruta))].map(ruta => aperturas.filter(a => a.ruta === ruta).length),
                    backgroundColor: '#F46036',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              {/* NUEVA: Aperturas por Tipo de Unidad */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Aperturas por Tipo de Unidad</h3>
                <Pie data={{
                  labels: [...new Set(aperturas.map(a => a.tipoUnidad || a.tipoVehiculo || 'Sin tipo'))],
                  datasets: [{
                    data: [...new Set(aperturas.map(a => a.tipoUnidad || a.tipoVehiculo || 'Sin tipo'))].map(tipo => aperturas.filter(a => (a.tipoUnidad || a.tipoVehiculo || 'Sin tipo') === tipo).length),
                    backgroundColor: ['#6F2234', '#B23A48', '#F46036', '#F7B801', '#2E294E', '#CBB26A'],
                  }],
                }} options={{ responsive: true }} />
              </div>
            </div>
          </>
        )}
        {tab === 'verificados' && (
          <>
            <h2 style={{ color: '#6F2234', textAlign: 'center', marginTop: '2rem' }}>Gráficas de Verificados</h2>
            {/* Filtro de mes para gráficas de fechas */}
            {mesesVerificados.length > 1 && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <select value={mesFiltroVerificados} onChange={e => setMesFiltroVerificados(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}>
                  <option value="">Todos los meses</option>
                  {mesesVerificados.sort().reverse().map(mes => (
                    <option key={mes} value={mes}>{mes}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Filtro de semana para gráficas de fechas */}
            {semanasVerificados.length > 1 && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <select value={semanaFiltroVerificados} onChange={e => setSemanaFiltroVerificados(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111' }}>
                  <option value="">Todas las semanas</option>
                  {semanasVerificados.sort().reverse().map(semana => (
                    <option key={semana} value={semana}>{semana}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
              {/* Gráfica por estado */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Verificaciones por Estado</h3>
                <Pie data={{
                  labels: [...new Set((semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).map(v => v.estado))],
                  datasets: [{
                    data: [...new Set((semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).map(v => v.estado))].map(estado => (semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).filter(v => v.estado === estado).length),
                    backgroundColor: ['#6F2234', '#B23A48', '#F46036', '#F7B801', '#2E294E'],
                  }],
                }} options={{ responsive: true }} />
              </div>
              {/* Gráfica por ruta */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Verificaciones por Ruta</h3>
                <Bar data={{
                  labels: [...new Set((semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).map(v => v.ruta))],
                  datasets: [{
                    label: 'Cantidad',
                    data: [...new Set((semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).map(v => v.ruta))].map(ruta => (semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).filter(v => v.ruta === ruta).length),
                    backgroundColor: '#2E294E',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              {/* NUEVA: Verificados por Día de la Semana */}
              <div style={{ width: 350, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ textAlign: 'center', color: '#6F2234' }}>Verificados por Día de la Semana</h3>
                <Bar data={{
                  labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                  datasets: [{
                    label: 'Cantidad',
                    data: [0, 1, 2, 3, 4, 5, 6].map(dia => (semanaFiltroVerificados ? verificadosFiltradosSemana : verificadosFiltradosMes).filter(v => {
                      if (!v.fechaApertura) return false;
                      return new Date(v.fechaApertura).getDay() === dia;
                    }).length),
                    backgroundColor: '#CBB26A',
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </>
        )}
        {tab === 'programador' && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#6F2234', textAlign: 'center' }}>Tablas de Programador</h2>
            {/* Filtro por fecha específica para tabla de programador */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <input
                type="date"
                value={fechaFiltroTablaProgramador}
                onChange={e => setFechaFiltroTablaProgramador(e.target.value)}
                style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}
              />
              {fechaFiltroTablaProgramador && (
                <button onClick={() => setFechaFiltroTablaProgramador('')} style={{ marginLeft: 8, padding: '0.3rem 0.7rem', borderRadius: 6, background: '#eee', border: 'none', cursor: 'pointer' }}>Limpiar fecha</button>
              )}
            </div>
            {(() => {
              // Mostrar todas las programaciones según los filtros seleccionados
              let itemsFiltrados = programaciones;
              if (fechaFiltroTablaProgramador) {
                // Filtrar por fecha exacta (solo día)
                itemsFiltrados = itemsFiltrados.filter(p => {
                  if (!p.fechaCreacion) return false;
                  const fechaCreacion = new Date(p.fechaCreacion);
                  const fechaFiltro = new Date(fechaFiltroTablaProgramador);
                  return fechaCreacion.getFullYear() === fechaFiltro.getFullYear() &&
                    fechaCreacion.getMonth() === fechaFiltro.getMonth() &&
                    fechaCreacion.getDate() === fechaFiltro.getDate();
                });
              } else if (semanaFiltroProgramador) {
                itemsFiltrados = itemsFiltrados.filter(p => getWeekYear(p.fechaCreacion) === semanaFiltroProgramador);
              } else if (mesFiltroProgramador) {
                itemsFiltrados = itemsFiltrados.filter(p => getMonthYear(p.fechaCreacion) === mesFiltroProgramador);
              }
              const programacionesPorFechaFiltrado = agruparPorFecha(itemsFiltrados, 'fechaCreacion');
              return Object.keys(programacionesPorFechaFiltrado).length === 0 ? (
                <p style={{ textAlign: 'center' }}>No hay programaciones registradas</p>
              ) : (
                Object.entries(programacionesPorFechaFiltrado)
                  .filter(([fecha]) => !fechaFiltroProgramador || fechaFiltroProgramador === fecha)
                  .map(([fecha, items]) => (
                    <div key={fecha} style={{ marginBottom: '2rem', background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 4px #0001', padding: 16 }}>
                      <h3 style={{ color: '#6F2234', marginBottom: 8 }}>Fecha: {fecha}</h3>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0, background: 'white', borderRadius: 8, width: '100%', minWidth: 'unset' }}>
                          {/* Encabezados */}
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Ruta</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Tipo Unidad</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Inicial</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Final</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Hora Salida</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Acciones</div>
                          {/* Filas */}
                          {items.map((pr, idx) => (
                            <React.Fragment key={pr._id}>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{pr.ruta}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{pr.tipoUnidad || pr.tipoVehiculo}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{pr.corridaInicial}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f9f9fa', fontWeight: 500 }}>{pr.corridaFinal}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f9f9fa', fontWeight: 500 }}>{pr.horaSalida}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f9f9fa', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleDeleteProgramacion(pr._id)}
                                  style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.6rem',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Eliminar programación"
                                >
                                  🗑️
                                </button>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button onClick={() => handleAcuseProgramadorPorFecha(fecha, items)} style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                          Generar acuse PDF de esta tabla
                        </button>
                      </div>
                      {/* ...eliminado: TablaEspecial, ya que no está definida... */}
                    </div>
                  ))
              );
            })()}
          </section>
        )}
        {tab === 'apertura' && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#6F2234', textAlign: 'center' }}>Tablas de Apertura</h2>
            {/* Filtros para la tabla de aperturas */}
            {(() => {
              const mesesAperturas = [...new Set(aperturas.filter(a => a.fechaApertura).map(a => getMonthYear(a.fechaApertura)))];
              const semanasAperturas = [...new Set(aperturas.filter(a => a.fechaApertura).map(a => getWeekYear(a.fechaApertura)))];
              return (
                <>
                  {/* Filtro por fecha específica */}
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <input
                      type="date"
                      value={fechaFiltroAperturaTabla}
                      onChange={e => setFechaFiltroAperturaTabla(e.target.value)}
                      style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}
                    />
                    {fechaFiltroAperturaTabla && (
                      <button onClick={() => setFechaFiltroAperturaTabla('')} style={{ marginLeft: 8, padding: '0.3rem 0.7rem', borderRadius: 6, background: '#eee', border: 'none', cursor: 'pointer' }}>Limpiar fecha</button>
                    )}
                  </div>
                  {mesesAperturas.length > 1 && (
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <select value={mesFiltroAperturaTabla} onChange={e => setMesFiltroAperturaTabla(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}>
                        <option value="">Todos los meses</option>
                        {mesesAperturas.sort().reverse().map(mes => (
                          <option key={mes} value={mes}>{mes}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {semanasAperturas.length > 1 && (
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <select value={semanaFiltroAperturaTabla} onChange={e => setSemanaFiltroAperturaTabla(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111' }}>
                        <option value="">Todas las semanas</option>
                        {semanasAperturas.sort().reverse().map(semana => (
                          <option key={semana} value={semana}>{semana}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              );
            })()}
            {/* Lógica de filtrado para tablas: prioridad: fecha específica > semana > mes, y solo mostrar registros verificados */}
            {(() => {
              // Incluir registros con estado 'apertura' para edición, y otros estados verificados
              let itemsFiltrados = aperturas.filter(ap => ap.estado === 'apertura' || ap.estado === 'completado' || ap.estado === 'cancelado' || ap.estado === 'pendiente');
              if (fechaFiltroAperturaTabla) {
                // Filtrar por fecha exacta (solo día)
                itemsFiltrados = itemsFiltrados.filter(a => {
                  if (!a.fechaApertura) return false;
                  const fechaApertura = new Date(a.fechaApertura);
                  const fechaFiltro = new Date(fechaFiltroAperturaTabla);
                  return fechaApertura.getFullYear() === fechaFiltro.getFullYear() &&
                    fechaApertura.getMonth() === fechaFiltro.getMonth() &&
                    fechaApertura.getDate() === fechaFiltro.getDate();
                });
              } else if (semanaFiltroAperturaTabla) {
                itemsFiltrados = itemsFiltrados.filter(a => getWeekYear(a.fechaApertura) === semanaFiltroAperturaTabla);
              } else if (mesFiltroAperturaTabla) {
                itemsFiltrados = itemsFiltrados.filter(a => getMonthYear(a.fechaApertura) === mesFiltroAperturaTabla);
              }
              const aperturasPorFechaAprobacion = agruparPorFechaAprobacion(itemsFiltrados);
              return Object.keys(aperturasPorFechaAprobacion).length === 0 ? (
                <p style={{ textAlign: 'center' }}>No hay aperturas verificadas</p>
              ) : (
                Object.entries(aperturasPorFechaAprobacion)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .map(([fecha, items]) => (
                    <div key={fecha} style={{ marginBottom: '2rem', background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 4px #0001', padding: 16 }}>
                      <h3 style={{ color: '#6F2234', marginBottom: 8 }}>Fecha de aprobación: {fecha}</h3>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 0, background: 'white', borderRadius: 8, width: '100%', minWidth: 'unset' }}>
                          {/* Encabezados */}
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Ruta</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Tipo Unidad</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Económico</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Tarjetón</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Nombre</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Inicial</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Final</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Hora Salida</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Fecha Creación</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Estado</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Observaciones</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Ciclos Perdidos</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Acciones</div>
                          {/* Filas */}
                          {items.sort((a, b) => new Date(b.ultimaModificacion?.fecha || b.updatedAt || b.createdAt) - new Date(a.ultimaModificacion?.fecha || a.updatedAt || a.createdAt)).map((ap, idx) => (
                            <React.Fragment key={ap._id}>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.ruta}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.tipoUnidad}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.economico}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.tarjeton}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.nombre}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.corridaInicial}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.corridaFinal}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.horaSalida}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.createdAt ? new Date(ap.createdAt).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.estado === 'cancelado' ? 'rechazado' : (ap.estado === 'completado' || ap.estado === 'dashboard') ? 'aceptado' : 'pendiente'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.observaciones || '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.ciclosPerdidos || '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleDeleteApertura(ap._id)}
                                  style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.6rem',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Eliminar apertura"
                                >
                                  🗑️
                                </button>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button onClick={() => handleAcuseVerificacionesPorFecha(fecha, items)} style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                          Generar acuse PDF de esta tabla
                        </button>
                      </div>
                    </div>
                  ))
              );
            })()}
          </section>
        )}
        {tab === 'verificados' && (
          <section>
            <h2 style={{ color: '#6F2234', textAlign: 'center' }}>Tablas de Verificados (Aceptados / Rechazados / Pendiente)</h2>
            {/* Filtro por fecha específica para tabla de verificados */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <input
                type="date"
                value={fechaFiltroTablaVerificados}
                onChange={e => setFechaFiltroTablaVerificados(e.target.value)}
                style={{ padding: '0.4rem 1rem', borderRadius: 6, color: '#111', marginRight: 8 }}
              />
              {fechaFiltroTablaVerificados && (
                <button onClick={() => setFechaFiltroTablaVerificados('')} style={{ marginLeft: 8, padding: '0.3rem 0.7rem', borderRadius: 6, background: '#eee', border: 'none', cursor: 'pointer' }}>Limpiar fecha</button>
              )}
            </div>
            {(() => {
              let itemsFiltrados = verificados;
              if (fechaFiltroTablaVerificados) {
                // Filtrar por fecha exacta (solo día)
                itemsFiltrados = itemsFiltrados.filter(v => {
                  if (!v.fechaApertura) return false;
                  const fechaApertura = new Date(v.fechaApertura);
                  const fechaFiltro = new Date(fechaFiltroTablaVerificados);
                  return fechaApertura.getFullYear() === fechaFiltro.getFullYear() &&
                    fechaApertura.getMonth() === fechaFiltro.getMonth() &&
                    fechaApertura.getDate() === fechaFiltro.getDate();
                });
              } else if (semanaFiltroVerificados) {
                itemsFiltrados = verificados.filter(v => getWeekYear(v.fechaApertura) === semanaFiltroVerificados);
              } else if (mesFiltroVerificados) {
                itemsFiltrados = verificados.filter(v => getMonthYear(v.fechaApertura) === mesFiltroVerificados);
              }
              const verificadosPorFechaFiltrado = agruparPorFecha(itemsFiltrados, 'fechaApertura');
              return Object.keys(verificadosPorFechaFiltrado).length === 0 ? (
                <p style={{ textAlign: 'center' }}>No hay aperturas aceptadas o rechazadas</p>
              ) : (
                Object.entries(verificadosPorFechaFiltrado)
                  .filter(([fecha]) => !fechaFiltroVerificados || fechaFiltroVerificados === fecha)
                  .map(([fecha, items]) => (
                    <div key={fecha} style={{ marginBottom: '2rem', background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 4px #0001', padding: 16 }}>
                      <h3 style={{ color: '#6F2234', marginBottom: 8 }}>Fecha: {fecha}</h3>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 0, background: 'white', borderRadius: 8, width: '100%', minWidth: 'unset', marginBottom: 16 }}>
                          {/* Encabezados */}
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Ruta</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Tipo Unidad</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Económico</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Tarjetón</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Nombre</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Inicial</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Corrida Final</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Hora Salida</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Fecha Apertura</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Estado</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Motivo</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Ciclos perdidos</div>
                          <div style={{ fontWeight: 700, color: '#6F2234', padding: '0.7rem 0.5rem', borderBottom: '2px solid #ececec', background: '#f3f3f7' }}>Acciones</div>
                          {/* Filas */}
                          {items.map((ap, idx) => (
                            <React.Fragment key={ap._id}>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.ruta}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.tipoUnidad}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.economico}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.tarjeton}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.nombre}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.corridaInicial}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.corridaFinal}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.horaSalida}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.fechaApertura ? new Date(ap.fechaApertura).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.estado === 'cancelado' ? 'rechazado' : (ap.estado === 'completado' || ap.estado === 'dashboard') ? 'aceptado' : 'pendiente'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.observaciones || '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500 }}>{ap.ciclosPerdidos || '-'}</div>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleDeleteApertura(ap._id)}
                                  style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.6rem',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Eliminar apertura"
                                >
                                  🗑️
                                </button>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button onClick={() => handleAcuseVerificacionesPorFecha(fecha, items)} style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                          Generar acuse PDF de esta tabla
                        </button>
                      </div>
                    </div>
                  ))
              );
            })()}
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;