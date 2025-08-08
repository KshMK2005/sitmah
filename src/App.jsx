import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import './themes.css';
import { applySavedTheme } from './utils/theme';
import Swal from 'sweetalert2';
import logoSitmah from './assets/logo-sitmah.png';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import TablasGuardadas from './components/TablasGuardadas';
import Historial from './pages/Historial';
import { programacionService, usuarioService } from './services/api';
import Select from 'react-select';
import { useTransition } from './components/TransitionContext';
import { aperturaService } from './services/api';
import { operadorService } from './services/operadores';
import LluviaSanValentin from './components/LluviaSanValentin';
import LluviaNavidad from './components/LluviaNavidad';
import * as XLSX from 'xlsx';

// Clave constante para localStorage
const STORAGE_KEY = 'horariosActuales';

function App() {
  // Aplica el tema global guardado al cargar la app
  useEffect(() => {
    applySavedTheme();
  }, []);
  const [ruta, setRuta] = useState('');
  const [intervalo, setIntervalo] = useState('');
  const [corridaIni, setCorridaIni] = useState('');
  const [horaProgramada, setHoraProgramada] = useState('');
  const [salidaIni, setSalidaIni] = useState(new Date(new Date().setHours(5, 50, 0, 0)));
  const [fechaDel, setFechaDel] = useState(new Date());
  const [fechaAl, setFechaAl] = useState(new Date());
  const [filtro, setFiltro] = useState('');
  const [schedules, setSchedules] = useState(() => {
    // Inicializar el estado con los datos del localStorage
    const savedSchedules = localStorage.getItem(STORAGE_KEY);
    return savedSchedules ? JSON.parse(savedSchedules) : [];
  });
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [programaciones, setProgramaciones] = useState([]);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [comentario, setComentario] = useState('');
  const [tipoUnidad, setTipoUnidad] = useState('');
  const [economico, setEconomico] = useState('');
  const [tarjeton, setTarjeton] = useState('');
  const [nombre, setNombre] = useState('');
  const [operadores, setOperadores] = useState([]);


  // Estado para controlar la búsqueda
  const [buscandoOperador, setBuscandoOperador] = useState(false);
  
  // Estados para importador masivo
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);

  // Buscar automáticamente el nombre del operador por tarjetón
  useEffect(() => {
    const buscarOperadorPorTarjeton = async () => {
      console.log('🔍 useEffect ejecutado - tarjetón actual:', tarjeton);

      if (tarjeton && tarjeton.trim() !== '') {
        console.log('🔍 Buscando operador para tarjetón:', tarjeton.trim());
        setBuscandoOperador(true);

        try {
          const operador = await operadorService.buscarPorTarjeton(tarjeton.trim());
          console.log('✅ Operador encontrado:', operador);

          if (operador && operador.nombre) {
            console.log('✅ Estableciendo nombre:', operador.nombre);
            setNombre(operador.nombre);
          } else {
            console.log('❌ Operador sin nombre, limpiando campo');
            setNombre('');
          }
                } catch (err) {
          console.error('❌ Error al buscar operador:', err);
          setNombre('');
        } finally {
          setBuscandoOperador(false);
        }
      } else {
        console.log('🔍 Tarjetón vacío, limpiando nombre');
        setNombre('');
        setBuscandoOperador(false);
      }
    };

    // Agregar un pequeño delay para evitar muchas peticiones mientras el usuario escribe
    const timeoutId = setTimeout(buscarOperadorPorTarjeton, 500);

    return () => clearTimeout(timeoutId);
  }, [tarjeton]);
  const { navigateWithTransition } = useTransition();
  const location = useLocation();
  const role = localStorage.getItem('userRole');

  // Guardar en localStorage cada vez que schedules cambie
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules]);

  // Cargar datos de edición si existen
  useEffect(() => {
    if (location.state?.editandoTabla) {
      const { datos } = location.state.editandoTabla;
      setSchedules(datos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      navigateWithTransition(location.pathname, { replace: true });
    }
  }, [location.state, navigateWithTransition]);

  // Cargar programaciones, rutas y operadores al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [programacionesData, operadoresData] = await Promise.all([
          programacionService.getAll(),
          operadorService.obtenerTodos()
        ]);

        setProgramaciones(programacionesData || []);
        setOperadores(operadoresData || []);

        // Extraer rutas únicas
        const rutasUnicas = Array.from(new Set((programacionesData || []).map(p => p.ruta)));
        setRutasDisponibles(rutasUnicas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // Si hay error, establecer arrays vacíos
        setProgramaciones([]);
        setOperadores([]);
        setRutasDisponibles([]);
      }
    };
    cargarDatos();
  }, []);





  // Cuando se selecciona una ruta, poner la hora de salida, intervalo y corridas de la programación
  useEffect(() => {
    if (ruta && programaciones.length > 0) {
      const prog = programaciones.find(p => p.ruta === ruta);
      if (prog) {
        // Hora de salida
        if (prog.horaSalida) {
          const [h, m] = prog.horaSalida.split(':');
          const nuevaFecha = new Date();
          nuevaFecha.setHours(Number(h), Number(m), 0, 0);
          setSalidaIni(nuevaFecha);
        }
        // Hora programada (se establece automáticamente desde la programación)
        if (prog.horaSalida) {
          setHoraProgramada(prog.horaSalida);
        }
        // Intervalo y corridas
        setIntervalo(prog.intervalo || '');
        setCorridaIni(prog.corridaInicial || '');
        // Mostrar número económico y tipo de unidad si existen
        if (prog.numeroEconomico) setEconomico(prog.numeroEconomico);
        if (prog.tipoVehiculo) setTipoUnidad(prog.tipoVehiculo);
      }
    }
  }, [ruta, programaciones]);

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setRuta('');
    setIntervalo('');
    setCorridaIni('');
    setHoraProgramada('');
    setSalidaIni(new Date(new Date().setHours(5, 50, 0, 0)));
    setFechaDel(new Date());
    setFechaAl(new Date());
    setComentario('');
    setTipoUnidad('');
    setEconomico('');
    setTarjeton('');
    setNombre('');
    setErrores({});
  };



  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!ruta.trim()) {
      nuevosErrores.ruta = 'La ruta es obligatoria';
    }

    if (intervalo && (isNaN(intervalo) || Number(intervalo) <= 0)) {
      nuevosErrores.intervalo = 'El intervalo debe ser un número positivo';
    }

    if (corridaIni && (isNaN(corridaIni) || Number(corridaIni) <= 0)) {
      nuevosErrores.corridaIni = 'El número de corrida debe ser un número positivo';
    }

    if (fechaDel > fechaAl) {
      nuevosErrores.fechas = 'La fecha inicial no puede ser posterior a la fecha final';
    }

    if (!tipoUnidad.trim()) {
      nuevosErrores.tipoUnidad = 'El tipo de unidad es obligatorio';
    }

    if (!economico.trim()) {
      nuevosErrores.economico = 'El número económico es obligatorio';
    }

    if (!tarjeton.trim()) {
      nuevosErrores.tarjeton = 'El tarjetón es obligatorio';
    }

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del operador es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const getHoraString = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      Swal.fire({
        title: 'Error de validación',
        text: 'Por favor, corrige los errores en el formulario',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Capturar la hora actual al momento de enviar
    const horaActual = new Date();

    const nuevoHorario = {
      id: editandoId || Date.now(),
      ruta,
      fecha: fechaDel.toISOString().slice(0, 10),
      horaSalida: getHoraString(horaActual),
      intervalo: intervalo || null,
      corridaIni: corridaIni || null,
      horaProgramada: horaProgramada || '',
      comentario: comentario || '',
      apertura: {
        tipoUnidad,
        economico,
        tarjeton,
        nombre
      }
    };

    if (editandoId !== null) {
      const idAEditar = localStorage.getItem('editandoHorarioId') || editandoId;
      const nuevosHorarios = schedules.map(s =>
        String(s.id) === String(idAEditar) ? { ...nuevoHorario } : s
      );
      setSchedules(nuevosHorarios);
      setEditandoId(null);
      localStorage.removeItem('editandoHorarioId');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Registro actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      setSchedules(prev => [...prev, nuevoHorario]);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Registro agregado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }

    limpiarFormulario();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6F2234",
      cancelButtonColor: "#CBB26A",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosHorarios = schedules.filter(s => s.id !== id);
        setSchedules(nuevosHorarios);
        if (nuevosHorarios.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        }
        Swal.fire({
          title: "¡Eliminado!",
          text: "El registro ha sido eliminado",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleEdit = (item) => {
    setRuta(item.ruta);
    setIntervalo(item.intervalo || '');
    setCorridaIni(item.corridaIni || '');
    setHoraProgramada(item.horaProgramada || '');
    setFechaDel(new Date(item.fecha));
    const [hours, minutes] = item.horaSalida.split(':');
    const nuevaFecha = new Date();
    nuevaFecha.setHours(Number(hours), Number(minutes), 0, 0);
    setSalidaIni(nuevaFecha);
    setComentario(item.comentario || '');
    setEditandoId(item.id);
    setTipoUnidad(item.apertura?.tipoUnidad || '');
    setEconomico(item.apertura?.economico || '');
    setTarjeton(item.apertura?.tarjeton || '');
    setNombre(item.apertura?.nombre || '');



    localStorage.setItem('editandoHorarioId', item.id);
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    limpiarFormulario();
  };

  const handleSaveToDatabase = async () => {
    if (schedules.length === 0) {
      Swal.fire({
        title: "Error",
        text: "No hay horarios para guardar",
        icon: "error",
        confirmButtonText: "Entendido"
      });
      return;
    }

    Swal.fire({
      title: "¿Quieres guardar esta tabla de horarios?",
      text: "Se guardará como una única tabla con todos los horarios actuales y se enviarán a verificador.",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6F2234",
      cancelButtonColor: "#CBB26A"
    }).then(async (result) => {
      if (result.isConfirmed) {
        let errores = [];
        let exitosos = 0;
        
        for (const horario of schedules) {
          try {
            // Buscar la programación correspondiente a la ruta
            const prog = programaciones.find(p => p.ruta === horario.ruta);
            if (!prog || !prog._id) {
              throw new Error('No se encontró una programación válida para la ruta: ' + horario.ruta);
            }

            // Calcular diferencia entre hora programada y hora real
            let estado = 'completado';
            if (horario.horaProgramada && horario.horaSalida) {
              const horaProgramada = new Date();
              const [horaProg, minProg] = horario.horaProgramada.split(':').map(Number);
              horaProgramada.setHours(horaProg, minProg, 0, 0);

              const horaReal = new Date();
              const [horaRealH, minReal] = horario.horaSalida.split(':').map(Number);
              horaReal.setHours(horaRealH, minReal, 0, 0);

              const diferenciaMs = horaReal.getTime() - horaProgramada.getTime();
              const diferenciaMinutos = Math.abs(diferenciaMs / (1000 * 60));

              // Si hay más de 3 minutos de diferencia, marcar como pendiente
              if (diferenciaMinutos > 3) {
                estado = 'pendiente';
                console.log(`🚨 Retraso detectado: ${diferenciaMinutos.toFixed(1)} minutos para ruta ${horario.ruta}`);
              }
            }

            await aperturaService.create({
              programacionId: prog._id,
              ruta: horario.ruta,
              intervalo: Number(horario.intervalo),
              corridaInicial: Number(horario.corridaIni),
              corridaFinal: Number(horario.corridaIni), // Usar la misma corrida inicial como final
              horaSalida: horario.horaSalida.slice(0, 5), // Asegura formato HH:mm
              horaProgramada: horario.horaProgramada || '',
              tipoUnidad: (horario.apertura?.tipoUnidad || '').toUpperCase(),
              economico: (horario.apertura?.economico || '').toUpperCase(),
              tarjeton: (horario.apertura?.tarjeton || '').toUpperCase(),
              nombre: horario.apertura?.nombre || '',
              comentario: horario.comentario || '',
              estado: estado,
              fechaApertura: new Date().toISOString(),
              usuarioCreacion: 'sistema'
            });
            exitosos++;
          } catch (error) {
            let mensaje = error?.response?.data?.message || error.message || "Ocurrió un error al guardar el horario";
            // Si el error es un objeto Error con un mensaje JSON, intentar parsear
            if (!mensaje && typeof error === 'object' && error !== null) {
              try {
                const parsed = JSON.parse(error.message);
                mensaje = parsed.message || parsed.error || error.message;
              } catch { }
            }
            errores.push(`Ruta ${horario.ruta}: ${mensaje}`);
          }
        }
        
        // Mostrar resultado final
        if (errores.length > 0) {
          Swal.fire({
            title: "Guardado parcial",
            html: `
              <p>✅ ${exitosos} horarios guardados exitosamente</p>
              <p>❌ ${errores.length} errores:</p>
              <ul style="text-align: left; max-height: 200px; overflow-y: auto;">
                ${errores.map(err => `<li>${err}</li>`).join('')}
              </ul>
            `,
            icon: "warning",
            confirmButtonText: "Entendido"
          });
        } else {
          setSchedules([]);
          localStorage.removeItem(STORAGE_KEY);
          limpiarFormulario();
          setEditandoId(null);
          setFiltro('');
          Swal.fire({
            title: "¡Guardado!",
            text: "Los horarios se han enviado a verificador correctamente",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigateWithTransition('/home');
  };

  const handleApertura = (horario) => {
    navigateWithTransition('/apertura', {
      state: {
        horarioId: horario.id,
        horarioData: horario
      }
    });
  };

  // Funciones para importador masivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Filtrar filas vacías y procesar datos
        const processedData = jsonData
          .filter(row => row.length > 0 && row.some(cell => cell && cell.toString().trim() !== ''))
          .filter(row => {
            // Filtrar filas que contengan datos de unidades (tienen económico y tarjetón)
            const hasEconomico = row[2] && row[2].toString().trim() !== '';
            const hasTarjeton = row[3] && row[3].toString().trim() !== '';
            const hasNombre = row[4] && row[4].toString().trim() !== '';
            return hasEconomico && hasTarjeton && hasNombre;
          })
          .map(row => {
            // Mapear tipos de unidad del Excel a los valores esperados por la API
            const tipoUnidadExcel = (row[0] || '').toLowerCase().trim();
            let tipoUnidadMapeado = 'URBANO'; // valor por defecto
            
            if (tipoUnidadExcel.includes('gran viale')) {
              tipoUnidadMapeado = 'GRAN VIALE';
            } else if (tipoUnidadExcel.includes('boxer')) {
              tipoUnidadMapeado = 'BOXER';
            } else if (tipoUnidadExcel.includes('sprinter')) {
              tipoUnidadMapeado = 'SPRINTER';
            } else if (tipoUnidadExcel.includes('vagoneta')) {
              tipoUnidadMapeado = 'VAGONETA';
            } else if (tipoUnidadExcel.includes('orion')) {
              tipoUnidadMapeado = 'URBANO'; // Orion se mapea a URBANO
            }
            
            return {
              tipoUnidad: tipoUnidadMapeado,
              ruta: row[1] || '',
              economico: row[2] || '',
              tarjeton: row[3] || '',
              nombre: row[4] || '',
              // Campos que se rellenarán automáticamente
              horaSalida: '',
              intervalo: '',
              corridaInicial: '',
              corridaFinal: '',
              fechaApertura: new Date().toISOString().split('T')[0],
              estado: 'dashboard'
            };
          });

        setImportData(processedData);
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

    setImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of importData) {
        try {
          // Buscar programación correspondiente para rellenar campos faltantes
          const programacion = programaciones.find(p => 
            p.ruta === item.ruta && 
            (p.tipoUnidad || p.tipoVehiculo || '').toUpperCase().trim() === item.tipoUnidad
          );

          const aperturaData = {
            ruta: item.ruta,
            tipoUnidad: item.tipoUnidad.toUpperCase(),
            economico: item.economico.toString(),
            tarjeton: item.tarjeton.toString(),
            nombre: item.nombre,
            horaSalida: item.horaSalida || programacion?.horaSalida || '04:30',
            horaProgramada: item.horaSalida || programacion?.horaSalida || '04:30',
            intervalo: parseInt(item.intervalo || programacion?.intervalo || '15'),
            corridaInicial: parseInt(item.corridaInicial || programacion?.corridaInicial || '1'),
            corridaFinal: parseInt(item.corridaFinal || programacion?.corridaFinal || '1'),
            fechaApertura: item.fechaApertura,
            estado: 'dashboard',
            comentario: item.comentario || '',
            observaciones: item.comentario || ''
          };

          await aperturaService.create(aperturaData);
          successCount++;
        } catch (error) {
          console.error('Error al crear apertura:', error);
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

  // Detectar tema sanvalentin
  const [tema, setTema] = useState(localStorage.getItem('temaGlobal') || 'normal');
  useEffect(() => {
    const onStorage = () => setTema(localStorage.getItem('temaGlobal') || 'normal');
    window.addEventListener('storage', onStorage);
    const observer = new MutationObserver(() => setTema(localStorage.getItem('temaGlobal') || 'normal'));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  const filtered = schedules ? schedules.filter(item =>
    item.ruta.toLowerCase().includes(filtro.toLowerCase())
  ) : [];

  return (
    <div>
      {tema === 'sanvalentin' && <LluviaSanValentin />}
      {tema === 'navidad' && <LluviaNavidad />}
      {role !== 'administrador' && <Navbar />}
      <main className="main-content" style={{
        width: '100%',
        margin: '0 auto',
        padding: '1rem 0 0 0', // menos padding arriba
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        minHeight: '90vh',
        justifyContent: 'flex-start'
      }}>
        {/* Botón de importación masiva */}
        <div style={{ textAlign: 'center', marginBottom: '1rem', width: '100%', maxWidth: 900 }}>
          <button
            type="button"
            onClick={() => alert('¡Botón funcionando!')}
            style={{
              background: '#FF0000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '20px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            🚨 BOTÓN DE PRUEBA - CLICK AQUÍ
          </button>
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

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: '0.5rem', marginBottom: 8, width: '100%', maxWidth: 900, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(128, 0, 32, 0.08)', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
          <h2 style={{ marginTop: '0', marginBottom: '1.2rem', color: '#6F2234' }}>Nueva Programación</h2>
          <div className="form-grid-3col">
            <div className="form-group">
              <label>Ruta</label>
              <Select
                options={rutasDisponibles ? rutasDisponibles.map(r => ({ value: r, label: r })) : []}
                value={ruta ? { value: ruta, label: ruta } : null}
                onChange={option => setRuta(option ? option.value : '')}
                placeholder="Buscar o seleccionar ruta"
                isClearable
                isSearchable
                classNamePrefix="react-select"
              />
              {errores.ruta && <span className="error-message">{errores.ruta}</span>}
            </div>
            <div className="form-group">
              <label>Intervalo</label>
              <input
                type="number"
                value={intervalo}
                onChange={e => setIntervalo(e.target.value)}
                placeholder="Intervalo"
                className={`input ${errores.intervalo ? 'input-error' : ''}`}
              />
              {errores.intervalo && <span className="error-message">{errores.intervalo}</span>}
            </div>
            <div className="form-group">
              <label>No. de corrida</label>
              <input
                type="number"
                value={corridaIni}
                onChange={e => setCorridaIni(e.target.value)}
                placeholder="No. de corrida"
                className={`input ${errores.corridaIni ? 'input-error' : ''}`}
              />
              {errores.corridaIni && <span className="error-message">{errores.corridaIni}</span>}
            </div>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Hora programada</label>
                <input
                  type="time"
                  value={horaProgramada}
                  onChange={e => setHoraProgramada(e.target.value)}
                  className="input"
                  placeholder="HH:MM"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Del</label>
              <DatePicker
                selected={fechaDel}
                onChange={date => setFechaDel(date)}
                dateFormat="yyyy-MM-dd"
                className={`input ${errores.fechas ? 'input-error' : ''}`}
              />
            </div>
            {/* Eliminado el segundo DatePicker ("Al") */}
            {errores.fechas && <span className="error-message">{errores.fechas}</span>}

            <div className="form-group">
              <label>Tipo de Unidad</label>
              <input
                type="text"
                value={tipoUnidad}
                readOnly
                placeholder="Tipo de unidad asignado en programación"
                style={{ background: '#f7f7fa', color: '#333', fontWeight: 500 }}
              />
            </div>
            <div className="form-group">
              <label>Número Económico</label>
              <input
                type="text"
                value={economico}
                onChange={e => setEconomico(e.target.value)}
                placeholder="Número económico de la unidad"
                required
              />
            </div>
            <div className="form-group">
              <label>Tarjetón</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={tarjeton}
                  onChange={e => setTarjeton(e.target.value)}
                  placeholder="Ingrese el tarjetón para buscar al operador"
                  className={`input ${errores.tarjeton ? 'input-error' : ''}`}
                  style={{
                    textTransform: 'uppercase',
                    border: tarjeton && nombre ? '2px solid #4CAF50' : '1px solid #ddd',
                    transition: 'all 0.3s ease',
                    paddingRight: tarjeton ? '40px' : '12px'
                  }}
                />
                {tarjeton && (
                  <button
                    type="button"
                    onClick={() => {
                      setTarjeton('');
                      setNombre('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#999',
                      padding: '4px'
                    }}
                    title="Limpiar tarjetón"
                  >
                    ✕
                  </button>
                )}
              </div>
              {errores.tarjeton && <span className="error-message">{errores.tarjeton}</span>}
              {buscandoOperador && (
                <small style={{ color: '#ff9800', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  🔍 Buscando operador...
                </small>
              )}
              {tarjeton && !nombre && !buscandoOperador && (
                <small style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  ❌ Operador no encontrado
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Nombre del Operador</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Se llena automáticamente al ingresar el tarjetón"
                className={`input ${errores.nombre ? 'input-error' : ''}`}
                readOnly
                style={{
                  background: nombre ? '#e8f5e8' : '#f7f7fa',
                  color: '#333',
                  fontWeight: nombre ? 600 : 500,
                  border: nombre ? '2px solid #4CAF50' : '1px solid #ddd',
                  transition: 'all 0.3s ease'
                }}
              />
              {errores.nombre && <span className="error-message">{errores.nombre}</span>}
              {nombre && (
                <small style={{ color: '#4CAF50', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  ✓ Operador encontrado automáticamente
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Comentario</label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Comentario opcional"
                className="input"
                rows={2}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" style={{ marginBottom: '1.2rem' }}>{editandoId !== null ? 'GUARDAR CAMBIOS' : 'SUBIR'}</button>
          {editandoId !== null && (
            <button type="button" className="btn-delete" onClick={handleCancelEdit} style={{ marginLeft: '1rem' }}>CANCELAR</button>
          )}
        </form>

        <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', marginBottom: 18 }}>
          <input
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Filtrar por ruta"
            className="input-filter"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 0 }}>
            <table className="table" style={{ width: '100%', minWidth: 900, tableLayout: 'fixed', borderRadius: 10, overflow: 'hidden' }}>
              <thead style={{ background: '#f3f3f7', color: '#6F2234', fontWeight: 700, fontSize: '1.05rem', borderBottom: '2px solid #e0e0e0' }}>
                <tr>
                  <th style={{ width: '15%', textAlign: 'center' }}>Ruta</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Fecha</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Hora Programada</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Unidad</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Tarjetón</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Operador</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center' }}>{row.ruta}</td>
                    <td style={{ textAlign: 'center' }}>{row.fecha}</td>
                    <td style={{ textAlign: 'center' }}>{row.horaProgramada || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.tipoUnidad || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.tarjeton || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.nombre || '-'}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'auto' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(row)} className="btn-edit action-btn" title="Editar horario">✏</button>
                        <button onClick={() => handleDelete(row.id)} className="btn-delete action-btn" title="Eliminar horario">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'right', marginTop: '0.8rem', width: '100%' }}>
            <button className="btn-submit" onClick={handleSaveToDatabase}>GUARDAR A LA BASE DE DATOS</button>
          </div>
        </div>

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
                  onClick={handleBulkImport}
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

export default App;