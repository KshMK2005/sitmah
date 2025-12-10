import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarProgramador from './NavbarProgramador';
import { programacionService } from '../services/api';
import '../Apertura.css';

function HistorialProgramador() {
  const navigate = useNavigate();
  const [programaciones, setProgramaciones] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const cargarProgramaciones = async () => {
      try {
        const data = await programacionService.getAll();
        setProgramaciones(data);
      } catch (error) {
        console.error("Error al cargar programaciones:", error);
      }
    };
    cargarProgramaciones();
  }, []);

  // Filtrar programaciones por año y mes seleccionados
  const programacionesFiltradas = programaciones.filter(pr => {
    if (!pr.fechaCreacion) return false;
    const fecha = new Date(pr.fechaCreacion);
    const cumpleAnio = filtroAnio ? (fecha.getFullYear().toString() === filtroAnio) : true;
    const cumpleMes = filtroMes ? ((fecha.getMonth() + 1).toString().padStart(2, '0') === filtroMes) : true;
    return cumpleAnio && cumpleMes;
  });

  // Agrupar programaciones filtradas por día
  const programacionesAgrupadas = programacionesFiltradas.reduce((acc, pr) => {
    const dia = pr.fechaCreacion ? (new Date(pr.fechaCreacion).toLocaleDateString()) : "Sin fecha";
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(pr);
    return acc;
  }, {});

  // Función para manejar la expansión de filas
  const toggleRowExpansion = (programacionId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(programacionId)) {
      newExpandedRows.delete(programacionId);
    } else {
      newExpandedRows.add(programacionId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="apertura-page">
      {/* Mostrar el navbar solo si NO es administrador */}
      {localStorage.getItem('userRole') !== 'administrador' && <NavbarProgramador />}
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', width:'100%' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6F2234 0%, #8B2E3F 100%)', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(111, 34, 52, 0.2)'
        }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '2rem', 
            margin: 0,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            📊 Historial de Programaciones
          </h2>
        </div>

        {/* Filtros compactos */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <select 
            value={filtroAnio} 
            onChange={e => setFiltroAnio(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '120px'
            }}
          >
            <option value="">Todos los años</option>
            {Array.from(new Set(programaciones.map(pr => pr.fechaCreacion && (new Date(pr.fechaCreacion).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
          <select 
            value={filtroMes} 
            onChange={e => setFiltroMes(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">Todos los meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                {new Date(0, i).toLocaleString('es-MX', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla de programaciones */}
        {programacionesFiltradas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: '#f8f9fa', 
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ color: '#6F2234', fontSize: '1.2rem', margin: 0 }}>
              No hay programaciones guardadas para este periodo.
            </p>
          </div>
        ) : (
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.95rem'
              }}>
                <thead>
                  <tr style={{ 
                    background: '#6F2234', 
                    color: '#fff'
                  }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Ruta</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Unidades</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Hora</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {programacionesFiltradas.map((pr, index) => (
                    <React.Fragment key={pr._id || index}>
                      <tr style={{ 
                        background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {formatDate(pr.fechaCreacion)}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#6F2234' }}>
                          {pr.ruta}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {pr.tipoVehiculo}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {pr.cantidadUnidades}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ 
                            background: '#6F2234', 
                            color: '#fff', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}>
                            {pr.horaSalida}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleRowExpansion(pr._id)}
                            style={{
                              background: expandedRows.has(pr._id) ? '#8B2E3F' : '#6F2234',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {expandedRows.has(pr._id) ? '🔽 Ocultar' : '🔍 Ver'}
                          </button>
                        </td>
                      </tr>
                      {/* Fila expandible con detalles */}
                      {expandedRows.has(pr._id) && (
                        <tr style={{ background: '#f8f9fa' }}>
                          <td colSpan="6" style={{ padding: '1.5rem' }}>
                            <div style={{ 
                              background: '#fff', 
                              borderRadius: '8px', 
                              padding: '1.5rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              <h4 style={{ 
                                color: '#6F2234', 
                                marginBottom: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                              }}>
                                Detalles de la Programación
                              </h4>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '1rem' 
                              }}>
                                <div><strong>Ruta:</strong> {pr.ruta}</div>
                                <div><strong>Tipo de Vehículo:</strong> {pr.tipoVehiculo}</div>
                                <div><strong>Número Económico:</strong> {pr.numeroEconomico}</div>
                                <div><strong>Cantidad de Unidades:</strong> {pr.cantidadUnidades}</div>
                                <div><strong>Intervalo:</strong> {pr.intervalo} minutos</div>
                                <div><strong>Corrida Inicial:</strong> {pr.corridaInicial}</div>
                                <div><strong>Corrida Final:</strong> {pr.corridaFinal}</div>
                                <div><strong>Hora de Salida:</strong> {pr.horaSalida}</div>
                                <div><strong>Programador:</strong> {pr.programador}</div>
                                <div><strong>Estado:</strong> 
                                  <span style={{ 
                                    background: pr.estado === 'activo' ? '#28a745' : '#dc3545',
                                    color: '#fff',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    marginLeft: '0.5rem',
                                    fontSize: '0.85rem'
                                  }}>
                                    {pr.estado}
                                  </span>
                                </div>
                              </div>
                              {pr.horarios && pr.horarios.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                  <h5 style={{ color: '#6F2234', marginBottom: '0.5rem' }}>Horarios Generados:</h5>
                                  <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '0.5rem' 
                                  }}>
                                    {pr.horarios.map((horario, idx) => (
                                      <span key={idx} style={{
                                        background: '#e9ecef',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                      }}>
                                        {horario.hora} - Corrida {horario.corrida}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HistorialProgramador;
