import React, { useEffect, useState } from 'react';
import NavbarVerificador from './NavbarVerificador';
import { aperturaService } from '../services/api';
import '../Apertura.css';

// Estilos CSS para animaciones
const animationStyles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      max-height: 500px;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
      max-height: 500px;
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
  }
  
  .expandable-row {
    overflow: hidden;
    transition: all 0.3s ease-out;
  }
  
  .expandable-row.expanded {
    animation: slideDown 0.3s ease-out;
  }
  
  .expandable-row.collapsed {
    animation: slideUp 0.3s ease-out;
  }
`;

function HistorialVerificador() {
  const [aperturas, setAperturas] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const cargarAperturas = async () => {
      try {
        const data = await aperturaService.getAll();
        // Mostrar aperturas que ya fueron verificadas (completado, cancelado, dashboard, retrasado)
        setAperturas(data.filter(ap => ['completado', 'cancelado', 'dashboard', 'retrasado'].includes(ap.estado)));
      } catch (error) {
        setAperturas([]);
      }
    };
    cargarAperturas();
  }, []);

  // Filtrar aperturas por año y mes seleccionados
  const aperturasFiltradas = aperturas.filter(ap => {
    if (!ap.fechaApertura) return false;
    const fecha = new Date(ap.fechaApertura);
    const cumpleAnio = filtroAnio ? (fecha.getFullYear().toString() === filtroAnio) : true;
    const cumpleMes = filtroMes ? ((fecha.getMonth() + 1).toString().padStart(2, '0') === filtroMes) : true;
    return cumpleAnio && cumpleMes;
  });

  // Agrupar aperturas filtradas por día
  const aperturasAgrupadas = aperturasFiltradas.reduce((acc, ap) => {
    const dia = ap.fechaApertura ? (new Date(ap.fechaApertura).toLocaleDateString()) : "Sin fecha";
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(ap);
    return acc;
  }, {});

  // Función para manejar la expansión de filas
  const toggleRowExpansion = (aperturaId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(aperturaId)) {
      newExpandedRows.delete(aperturaId);
    } else {
      newExpandedRows.add(aperturaId);
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

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
      case 'dashboard':
        return '#28a745';
      case 'cancelado':
        return '#dc3545';
      case 'retrasado':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="apertura-page">
      <style>{animationStyles}</style>
      {(!role || role !== 'administrador') && <NavbarVerificador />}
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
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
            📊 Historial de Verificaciones
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
            {Array.from(new Set(aperturas.map(ap => ap.fechaApertura && (new Date(ap.fechaApertura).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
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

        {/* Tabla de verificaciones */}
        {aperturasFiltradas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: '#f8f9fa', 
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ color: '#6F2234', fontSize: '1.2rem', margin: 0 }}>
              No hay verificaciones guardadas para este periodo.
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
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Operador</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Hora</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {aperturasFiltradas.map((ap, index) => (
                    <React.Fragment key={ap._id || index}>
                      <tr style={{ 
                        background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {formatDate(ap.fechaApertura)}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#6F2234' }}>
                          {ap.ruta}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {ap.nombre}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ 
                            background: getEstadoColor(ap.estado), 
                            color: '#fff', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}>
                            {ap.estado === 'cancelado' ? 'Rechazado' :
                             ap.estado === 'dashboard' ? 'Aprobado' :
                             ap.estado === 'retrasado' ? 'Retrasado' :
                             ap.estado === 'completado' ? 'Completado' : ap.estado}
                          </span>
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
                            {ap.horaSalida}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleRowExpansion(ap._id)}
                            style={{
                              background: expandedRows.has(ap._id) ? '#8B2E3F' : '#6F2234',
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
                            {expandedRows.has(ap._id) ? '🔽 Ocultar' : '🔍 Ver'}
                          </button>
                        </td>
                      </tr>
                      {/* Fila expandible con detalles */}
                      {expandedRows.has(ap._id) && (
                        <tr style={{ 
                          background: '#f8f9fa',
                          animation: 'slideDown 0.3s ease-out'
                        }}>
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
                                Detalles de la Verificación
                              </h4>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '1rem' 
                              }}>
                                <div><strong>Ruta:</strong> {ap.ruta}</div>
                                <div><strong>Operador:</strong> {ap.nombre}</div>
                                <div><strong>Económico:</strong> {ap.economico}</div>
                                <div><strong>Tarjetón:</strong> {ap.tarjeton}</div>
                                <div><strong>Hora de Salida:</strong> {ap.horaSalida}</div>
                                <div><strong>Estado:</strong> 
                                  <span style={{ 
                                    background: getEstadoColor(ap.estado),
                                    color: '#fff',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    marginLeft: '0.5rem',
                                    fontSize: '0.85rem'
                                  }}>
                                    {ap.estado === 'cancelado' ? 'Rechazado' :
                                     ap.estado === 'dashboard' ? 'Aprobado' :
                                     ap.estado === 'retrasado' ? 'Retrasado' :
                                     ap.estado === 'completado' ? 'Completado' : ap.estado}
                                  </span>
                                </div>
                                <div><strong>Fecha Apertura:</strong> {formatDate(ap.fechaApertura)}</div>
                                <div><strong>Motivo:</strong> {ap.estado === 'cancelado' ? (ap.observaciones || '-') : '-'}</div>
                                {ap.retraso && (
                                  <div><strong style={{ color: '#ffc107' }}>⚠️ Retraso:</strong> {ap.observaciones || 'Retraso detectado automáticamente'}</div>
                                )}
                              </div>
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

export default HistorialVerificador;
