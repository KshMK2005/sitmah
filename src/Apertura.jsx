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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cargar horarios actuales
    const horariosGuardados = JSON.parse(localStorage.getItem('horariosActuales') || '[]');

    // Actualizar el horario específico
    const horariosActualizados = horariosGuardados.map(h => {
      if (h.id === horarioId) {
        return {
          ...h,
          apertura: formData
        };
      }
      return h;
    });

    // Guardar en localStorage
    localStorage.setItem('horariosActuales', JSON.stringify(horariosActualizados));

    alert('Datos de apertura guardados correctamente');
    navigateWithTransition('/horarios');
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

  // Función para probar la búsqueda manualmente
  const probarBusqueda = async () => {
    console.log('Probando búsqueda manual...');
    setBuscandoOperador(true);
    try {
      const operador = await operadorService.buscarPorTarjeton('TPA0001');
      console.log('Resultado de búsqueda manual:', operador);
      if (operador) {
        setFormData(prev => ({
          ...prev,
          nombre: operador.nombre
        }));
        setOperadorEncontrado(true);
        setOperadorNoEncontrado(false);
        Swal.fire({
          title: 'Prueba exitosa',
          text: `Operador encontrado: ${operador.nombre}`,
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('Error en prueba manual:', error);
      setOperadorNoEncontrado(true);
      setOperadorEncontrado(false);
      Swal.fire({
        title: 'Error en prueba',
        text: error.message,
        icon: 'error'
      });
    } finally {
      setBuscandoOperador(false);
    }
  };

  // Función para verificar el estado de la base de datos
  const verificarEstadoDB = async () => {
    try {
      const response = await fetch(`${isProduction ? '/api' : 'http://localhost:5000/api'}/operadores/status`);
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          title: '✅ Base de datos conectada',
          html: `
            <p><strong>Total de operadores:</strong> ${data.totalOperadores}</p>
            <p><strong>Ejemplos:</strong></p>
            <ul style="text-align: left;">
              ${data.sampleOperadores.map(op => `<li>${op.tarjeton} - ${op.nombre}</li>`).join('')}
            </ul>
          `,
          icon: 'success'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
      Swal.fire({
        title: '❌ Error de conexión',
        text: 'No se pudo conectar con la base de datos',
        icon: 'error'
      });
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button type="button" onClick={probarBusqueda} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                🔍 Probar Búsqueda (TPA0001)
              </button>
              <button type="button" onClick={verificarEstadoDB} style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                📊 Verificar Base de Datos
              </button>
            </div>
            <button type="submit" className="btn-apertura">SUBIR</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Apertura;