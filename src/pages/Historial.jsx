import React, { useState, useEffect } from 'react';
import { applySavedTheme } from '../utils/theme';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { aperturaService } from '../services/api';
import '../Apertura.css';
import { useTransition } from '../components/TransitionContext';
import './Historial.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Historial({ adminMode, programadorMode }) {
  // Aplica el tema global guardado al cargar la página
  useEffect(() => {
    applySavedTheme();
  }, []);
  const navigate = useNavigate();
  const { navigateWithTransition } = useTransition();
  const [aperturas, setAperturas] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroDia, setFiltroDia] = useState(null);
  const [filtroOperador, setFiltroOperador] = useState('');
  const [filtroRuta, setFiltroRuta] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const cargarAperturas = async () => {
      try {
        const data = await aperturaService.getAll();
        setAperturas(data);
      } catch (error) {
        console.error("Error al cargar aperturas:", error);
      }
    };
    cargarAperturas();
  }, []);

  // Filtrar aperturas por año, mes, día, operador y ruta
  const aperturasFiltradas = aperturas.filter(ap => {
    if (!ap.fechaApertura) return false;
    const fecha = new Date(ap.fechaApertura);
    const cumpleAnio = filtroAnio ? (fecha.getFullYear().toString() === filtroAnio) : true;
    const cumpleMes = filtroMes ? ((fecha.getMonth() + 1).toString().padStart(2, '0') === filtroMes) : true;
    const cumpleDia = filtroDia ? (fecha.toDateString() === filtroDia.toDateString()) : true;
    const cumpleOperador = filtroOperador ? (ap.nombre && ap.nombre.toLowerCase().includes(filtroOperador.toLowerCase())) : true;
    const cumpleRuta = filtroRuta ? (ap.ruta && ap.ruta.toLowerCase().includes(filtroRuta.toLowerCase())) : true;
    return cumpleAnio && cumpleMes && cumpleDia && cumpleOperador && cumpleRuta;
  });

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
      case 'dashboard':
        return '#28a745';
      case 'cancelado':
        return '#dc3545';
      case 'pendiente':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="apertura-page">
      {!adminMode && (!role || role !== 'administrador') && <Navbar />}
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6F2234 0%, #A02142 100%)', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(111, 34, 52, 0.3)'
        }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '2rem', 
            margin: 0,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            📊 Historial de Aperturas
          </h2>
        </div>

        {/* Controles de filtro */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
          <h3 style={{ color: '#6F2234', fontSize: '1.8rem', margin: 0 }}>
            Aperturas Guardadas
          </h3>
          <button
            style={{ 
              background: '#6F2234', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '0.5rem 1rem', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              boxShadow: (mostrarFiltros ? '0 2px 8px rgba(111, 34, 52, 0.3)' : 'none'), 
              transition: 'box-shadow 0.2s' 
            }}
            onClick={() => setMostrarFiltros(f => !f)}
          >
            {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div style={{ 
            background: '#f9f9f9', 
            border: '1px solid #eee', 
            borderRadius: '8px', 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Año:
              <select 
                value={filtroAnio} 
                onChange={e => {
                  setFiltroAnio(e.target.value);
                  setFiltroMes('');
                  setFiltroDia(null);
                }} 
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.3rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc' 
                }}
              >
                <option value="">Todos</option>
                {Array.from(new Set(aperturas.map(ap => ap.fechaApertura && (new Date(ap.fechaApertura).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </label>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Mes:
              <select 
                value={filtroMes} 
                onChange={e => {
                  setFiltroMes(e.target.value);
                  setFiltroDia(null);
                }} 
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.3rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc' 
                }}
              >
                <option value="">Todos</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('es-MX', { month: 'long' })}
                  </option>
                ))}
              </select>
            </label>
            {filtroMes && (
              <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
                Día:
                <DatePicker
                  selected={filtroDia}
                  onChange={(date) => setFiltroDia(date)}
                  placeholderText="Seleccionar día..."
                  dateFormat="dd/MM/yyyy"
                  style={{ 
                    marginLeft: '0.5rem', 
                    padding: '0.3rem', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    minWidth: '120px'
                  }}
                />
              </label>
            )}
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Operador:
              <input
                type="text"
                placeholder="Buscar por operador..."
                value={filtroOperador}
                onChange={e => setFiltroOperador(e.target.value)}
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.3rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  minWidth: '150px'
                }}
              />
            </label>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Ruta:
              <input
                type="text"
                placeholder="Buscar por ruta..."
                value={filtroRuta}
                onChange={e => setFiltroRuta(e.target.value)}
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.3rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  minWidth: '150px'
                }}
              />
            </label>
          </div>
        )}

        {/* Contenido principal */}
        <div className="table-container">
          {aperturasFiltradas.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: '#f8f9fa', 
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ color: '#6F2234', fontSize: '1.2rem', margin: 0 }}>
                No hay aperturas guardadas para este periodo.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              {aperturasFiltradas.map((ap, index) => (
                <div key={ap._id || index} style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #eee'
                }}>
                  {/* Header de la card */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div>
                      <h3 style={{
                        color: '#6F2234',
                        fontSize: '1.2rem',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {ap.ruta} - {ap.nombre}
                      </h3>
                      <p style={{
                        color: '#666',
                        margin: 0,
                        fontSize: '0.9rem'
                      }}>
                        {formatDate(ap.fechaApertura)} - {ap.horaSalida}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ 
                        background: getEstadoColor(ap.estado), 
                        color: '#fff', 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {ap.estado}
                      </span>
                    </div>
                  </div>

                  {/* Detalles de la apertura */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Tipo Unidad
                      </div>
                      <div style={{ color: '#666' }}>
                        {ap.tipoUnidad}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Económico
                      </div>
                      <div style={{ color: '#666' }}>
                        {ap.economico}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Tarjetón
                      </div>
                      <div style={{ color: '#666' }}>
                        {ap.tarjeton}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Corrida Inicial
                      </div>
                      <div style={{ color: '#666' }}>
                        {ap.corridaInicial}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Corrida Final
                      </div>
                      <div style={{ color: '#666' }}>
                        {ap.corridaFinal}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: '500', color: '#6F2234' }}>
                        Estado
                      </div>
                      <div style={{ color: '#666' }}>
                        <span style={{ 
                          background: getEstadoColor(ap.estado),
                          color: '#fff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          {ap.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          style={{ 
            marginTop: '1.5rem', 
            background: '#6F2234', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem' 
          }}
          onClick={() => navigateWithTransition('/horarios')}
        >
          Volver a Horarios
        </button>
      </main>
    </div>
  );
}

export default Historial;