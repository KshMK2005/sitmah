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
  const [operadores, setOperadores] = useState([]);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);

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
    // Cargar programaciones y operadores al iniciar
    const cargarDatos = async () => {
      try {
        const [programacionesData, operadoresData] = await Promise.all([
          programacionService.getAll(),
          operadorService.obtenerTodos()
        ]);
        setProgramaciones(programacionesData);
        setOperadores(operadoresData);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los datos',
          icon: 'error'
        });
      }
    };
    cargarDatos();
  }, []);

  // Efecto para establecer el operador seleccionado cuando se cargan los operadores
  useEffect(() => {
    if (operadores.length > 0 && formData.tarjeton) {
      const operadorEncontrado = operadores.find(op => op.tarjeton === formData.tarjeton);
      if (operadorEncontrado) {
        setOperadorSeleccionado({
          value: operadorEncontrado.tarjeton,
          label: `${operadorEncontrado.tarjeton} - ${operadorEncontrado.nombre}`
        });
      }
    }
  }, [operadores, formData.tarjeton]);

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
  };

  // Manejar selección de operador
  const handleOperadorChange = (option) => {
    setOperadorSeleccionado(option);
    if (option) {
      setFormData(prev => ({
        ...prev,
        tarjeton: option.value,
        nombre: option.label
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tarjeton: '',
        nombre: ''
      }));
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
              <label htmlFor="operador">Operador:</label>
              <Select
                options={operadores.map(op => ({ 
                  value: op.tarjeton, 
                  label: `${op.tarjeton} - ${op.nombre}` 
                }))}
                value={operadorSeleccionado}
                onChange={handleOperadorChange}
                placeholder="Buscar o seleccionar operador"
                isClearable
                isSearchable
                classNamePrefix="react-select"
                noOptionsMessage={() => "No se encontraron operadores"}
                loadingMessage={() => "Cargando operadores..."}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comentario">Comentario:</label>
              <textarea 
                id="comentario" 
                name="comentario" 
                value={formData.comentario} 
                onChange={handleChange} 
                placeholder="Comentario opcional" 
                rows={2} 
                style={{ resize: 'vertical', width: '100%' }} 
              />
            </div>
          </div>
          <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-apertura">SUBIR</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Apertura;