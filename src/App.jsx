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
import { operadorService2 } from './services/operadores2';
import LluviaSanValentin from './components/LluviaSanValentin';
import LluviaNavidad from './components/LluviaNavidad';

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
  const [corridaFin, setCorridaFin] = useState('');
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
  const [operadors, setOperadors] = useState([]);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);

  // Buscar automáticamente el operador por tarjetón escrito manualmente
  useEffect(() => {
    if (tarjeton && operadors.length > 0) {
      const operadorEncontrado = operadors.find(op => String(op.tarjeton).toLowerCase() === String(tarjeton).toLowerCase());
      if (operadorEncontrado) {
        setOperadorSeleccionado({
          value: operadorEncontrado.tarjeton,
          label: `${operadorEncontrado.tarjeton} - ${operadorEncontrado.nombre}`
        });
        setNombre(operadorEncontrado.nombre);
      } else {
        setOperadorSeleccionado(null);
        setNombre('');
      }
    } else {
      setOperadorSeleccionado(null);
      setNombre('');
    }
  }, [tarjeton, operadors]);
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
        const [programacionesData, operadorsData] = await Promise.all([
          programacionService.getAll(),
          operadorService2.obtenerTodos()
        ]);

        setProgramaciones(programacionesData || []);
        setOperadors(operadorsData || []);

        // Extraer rutas únicas
        const rutasUnicas = Array.from(new Set((programacionesData || []).map(p => p.ruta)));
        setRutasDisponibles(rutasUnicas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // Si hay error, establecer arrays vacíos
        setProgramaciones([]);
        setOperadors([]);
        setRutasDisponibles([]);
      }
    };
    cargarDatos();
  }, []);

  // Efecto para establecer el operador seleccionado cuando se cargan los operadores y hay un horario en edición
  useEffect(() => {
    if (operadors.length > 0 && editandoId && tarjeton) {
      const operadorEncontrado = operadors.find(op => op.tarjeton === tarjeton);
      if (operadorEncontrado) {
        setOperadorSeleccionado({
          value: operadorEncontrado.tarjeton,
          label: `${operadorEncontrado.tarjeton} - ${operadorEncontrado.nombre}`
        });
      }
    }
  }, [operadors, editandoId, tarjeton]);

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
        // Intervalo y corridas
        setIntervalo(prog.intervalo || '');
        setCorridaIni(prog.corridaInicial || '');
        setCorridaFin(prog.corridaFinal || '');
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
    setCorridaFin('');
    setSalidaIni(new Date(new Date().setHours(5, 50, 0, 0)));
    setFechaDel(new Date());
    setFechaAl(new Date());
    setComentario('');
    setTipoUnidad('');
    setEconomico('');
    setTarjeton('');
    setNombre('');
    setOperadorSeleccionado(null);
    setErrores({});
  };

  // Manejar selección de operador
  const handleOperadorChange = (option) => {
    setOperadorSeleccionado(option);
    if (option) {
      setTarjeton(option.value);
      setNombre(option.label.split(' - ')[1]); // Obtener solo el nombre
    } else {
      setTarjeton('');
      setNombre('');
    }
  };

  // Manejar selección de nombre de operador
  const handleNombreChange = (option) => {
    if (option) {
      setNombre(option.value);
      // Buscar el tarjetón correspondiente al nombre seleccionado
      const operadorEncontrado = operadors.find(op => op.nombre === option.value);
      if (operadorEncontrado) {
        setTarjeton(operadorEncontrado.tarjeton);
        setOperadorSeleccionado({
          value: operadorEncontrado.tarjeton,
          label: `${operadorEncontrado.tarjeton} - ${operadorEncontrado.nombre}`
        });
      }
    } else {
      setNombre('');
      setTarjeton('');
      setOperadorSeleccionado(null);
    }
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
      nuevosErrores.corridaIni = 'La corrida inicial debe ser un número positivo';
    }

    if (corridaFin) {
      if (isNaN(corridaFin) || Number(corridaFin) <= 0) {
        nuevosErrores.corridaFin = 'La corrida final debe ser un número positivo';
      } else if (corridaIni && Number(corridaFin) <= Number(corridaIni)) {
        nuevosErrores.corridaFin = 'La corrida final debe ser mayor que la corrida inicial';
      }
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

    const nuevoHorario = {
      id: editandoId || Date.now(),
      ruta,
      fecha: fechaDel.toISOString().slice(0, 10),
      horaSalida: getHoraString(salidaIni),
      intervalo: intervalo || null,
      corridaIni: corridaIni || null,
      corridaFin: corridaFin || null,
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
    setCorridaFin(item.corridaFin || '');
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

    // Establecer el operador seleccionado si existe
    if (item.apertura?.tarjeton && operadors.length > 0) {
      const operadorEncontrado = operadors.find(op => op.tarjeton === item.apertura.tarjeton);
      if (operadorEncontrado) {
        setOperadorSeleccionado({
          value: operadorEncontrado.tarjeton,
          label: `${operadorEncontrado.tarjeton} - ${operadorEncontrado.nombre}`
        });
      } else {
        setOperadorSeleccionado(null);
      }
    } else {
      setOperadorSeleccionado(null);
    }

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
        for (const horario of schedules) {
          try {
            // Buscar la programación correspondiente a la ruta
            const prog = programaciones.find(p => p.ruta === horario.ruta);
            if (!prog || !prog._id) {
              throw new Error('No se encontró una programación válida para la ruta: ' + horario.ruta);
            }
            await aperturaService.create({
              programacionId: prog._id,
              ruta: horario.ruta,
              intervalo: Number(horario.intervalo),
              corridaInicial: Number(horario.corridaIni),
              corridaFinal: Number(horario.corridaFin),
              horaSalida: horario.horaSalida.slice(0, 5), // Asegura formato HH:mm
              tipoUnidad: (horario.apertura?.tipoUnidad || '').toUpperCase(),
              economico: (horario.apertura?.economico || '').toUpperCase(),
              tarjeton: (horario.apertura?.tarjeton || '').toUpperCase(),
              nombre: horario.apertura?.nombre || '',
              comentario: horario.comentario || '',
              // Estado por defecto: 'completado' para que aparezca en la sección principal del verificador
              estado: 'completado',
              fechaApertura: new Date().toISOString(),
              usuarioCreacion: 'sistema'
            });
          } catch (error) {
            let mensaje = error?.response?.data?.message || error.message || "Ocurrió un error al guardar el horario";
            // Si el error es un objeto Error con un mensaje JSON, intentar parsear
            if (!mensaje && typeof error === 'object' && error !== null) {
              try {
                const parsed = JSON.parse(error.message);
                mensaje = parsed.message || parsed.error || error.message;
              } catch { }
            }
            Swal.fire({
              title: "Error al guardar",
              text: mensaje,
              icon: "error",
              confirmButtonText: "Entendido"
            });
            return; // Detener el guardado si hay error
          }
        }
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
              <label>Corrida Inicial</label>
              <input
                type="number"
                value={corridaIni}
                onChange={e => setCorridaIni(e.target.value)}
                placeholder="Corrida Inicial"
                className={`input ${errores.corridaIni ? 'input-error' : ''}`}
              />
              {errores.corridaIni && <span className="error-message">{errores.corridaIni}</span>}
            </div>
            <div className="form-group">
              <label>Corrida Final</label>
              <input
                type="number"
                value={corridaFin}
                onChange={e => setCorridaFin(e.target.value)}
                placeholder="Corrida Final"
                className={`input ${errores.corridaFin ? 'input-error' : ''}`}
              />
              {errores.corridaFin && <span className="error-message">{errores.corridaFin}</span>}
            </div>
            <div className="form-group">
              <label>Hora de salida</label>
              <DatePicker
                selected={salidaIni}
                onChange={date => setSalidaIni(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Hora"
                dateFormat="HH:mm"
                className="input"
              />
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

            <div className="form-group">
              <label>Al</label>
              <DatePicker
                selected={fechaAl}
                onChange={date => setFechaAl(date)}
                dateFormat="yyyy-MM-dd"
                className={`input ${errores.fechas ? 'input-error' : ''}`}
              />
              {errores.fechas && <span className="error-message">{errores.fechas}</span>}
            </div>

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
              <Select
                options={operadors ? operadors.map(op => ({
                  value: op.tarjeton,
                  label: `${op.tarjeton} - ${op.nombre}`
                })) : []}
                value={operadorSeleccionado}
                onChange={handleOperadorChange}
                onInputChange={inputValue => setTarjeton(inputValue)}
                inputValue={tarjeton}
                placeholder="Buscar o escribir tarjetón"
                isClearable
                isSearchable
                classNamePrefix="react-select"
                noOptionsMessage={() => "No se encontraron operadores"}
                loadingMessage={() => "Cargando operadores..."}
                filterOption={(option, input) =>
                  option.data.value.toLowerCase().includes(input.toLowerCase()) ||
                  option.data.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
                         <div className="form-group">
               <label>Nombre del Operador</label>
               <Select
                 options={operadors ? operadors.map(op => ({
                   value: op.nombre,
                   label: `${op.tarjeton} - ${op.nombre}`
                 })) : []}
                 value={nombre ? { value: nombre, label: nombre } : null}
                 onChange={handleNombreChange}
                 placeholder="Seleccionar operador"
                 isClearable
                 isSearchable
                 classNamePrefix="react-select"
                 noOptionsMessage={() => "No se encontraron operadores"}
                 loadingMessage={() => "Cargando operadores..."}
               />
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
                  <th style={{ width: '12%', textAlign: 'center' }}>Ruta</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Fecha</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Hora de salida</th>
                  <th style={{ width: '14.70%', textAlign: 'center' }}>Unidad</th>
                  <th style={{ width: '15.5%', textAlign: 'center' }}>Tarjetón</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>Operador</th>
                  <th style={{ width: '19%', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center' }}>{row.ruta}</td>
                    <td style={{ textAlign: 'center' }}>{row.fecha}</td>
                    <td style={{ textAlign: 'center' }}>{row.horaSalida}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.tipoUnidad || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.tarjeton || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{row.apertura?.nombre || '-'}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'auto' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(row)} className="btn-edit action-btn" title="Editar horario">✏</button>
                        <button onClick={() => handleApertura(row)} className="btn-submit action-btn" style={{ padding: '0.3rem 0.5rem' }} title="Asignar unidad">🚌</button>
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
      </main>
    </div>
  );
}

export default App;