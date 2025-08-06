import React, { useEffect, useState } from 'react';
import { programacionService } from '../services/api';
import NavbarProgramador from './NavbarProgramador';
import '../Apertura.css';

// Estilos CSS para animaciones mejoradas
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
  
  .expandable-row.collapsing {
    animation: slideUp 0.3s ease-out;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 1rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid #6F2234;
    background: #fff;
    color: #6F2234;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .pagination button:hover {
    background: #6F2234;
    color: #fff;
  }
  
  .pagination button:disabled {
    background: #f5f5f5;
    color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }
  
  .pagination button.active {
    background: #6F2234;
    color: #fff;
  }
  
  .pagination-info {
    color: #6F2234;
    font-weight: 600;
    margin: 0 1rem;
  }
`;

function ProgramacionesGuardadas() {
  const [programaciones, setProgramaciones] = useState([]);
  const [filtro, setFiltro] = useState({ tipoVehiculo: '', ruta: '', fecha: '' });
  const [filtradas, setFiltradas] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [collapsingRows, setCollapsingRows] = useState(new Set());
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await programacionService.getAll();
        setProgramaciones(data);
        setFiltradas(data);
      } catch (e) {
        setProgramaciones([]);
        setFiltradas([]);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    let resultado = programaciones;
    if (filtro.tipoVehiculo) {
      resultado = resultado.filter(p => p.tipoVehiculo === filtro.tipoVehiculo);
    }
    if (filtro.ruta) {
      resultado = resultado.filter(p => p.ruta.toLowerCase().includes(filtro.ruta.toLowerCase()));
    }
    if (filtro.fecha) {
      resultado = resultado.filter(p => p.fechaCreacion && new Date(p.fechaCreacion).toISOString().slice(0,10) === filtro.fecha);
    }
    setFiltradas(resultado);
    setCurrentPage(1); // Reset a la primera página cuando se aplica un filtro
  }, [filtro, programaciones]);

  // Función para manejar la expansión de filas con animación de cierre
  const toggleRowExpansion = (programacionId) => {
    const newExpandedRows = new Set(expandedRows);
    const newCollapsingRows = new Set(collapsingRows);
    
    if (newExpandedRows.has(programacionId)) {
      // Iniciar animación de cierre
      newCollapsingRows.add(programacionId);
      setCollapsingRows(newCollapsingRows);
      
      // Esperar a que termine la animación antes de ocultar
      setTimeout(() => {
        newExpandedRows.delete(programacionId);
        newCollapsingRows.delete(programacionId);
        setExpandedRows(newExpandedRows);
        setCollapsingRows(newCollapsingRows);
      }, 300); // Duración de la animación
    } else {
      // Abrir directamente
      newExpandedRows.add(programacionId);
      setExpandedRows(newExpandedRows);
    }
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

  // Cálculos de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtradas.length / itemsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cerrar todas las filas expandidas al cambiar de página
    setExpandedRows(new Set());
    setCollapsingRows(new Set());
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="programador-page">
      <style>{animationStyles}</style>
      {(!role || role !== 'administrador') && <NavbarProgramador />}
      <main className="programador-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
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
            📊 Programaciones Guardadas
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
            value={filtro.tipoVehiculo} 
            onChange={e => setFiltro(f => ({ ...f, tipoVehiculo: e.target.value }))}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="GRAN VIALE">GRAN VIALE</option>
            <option value="BOXER">BOXER</option>
            <option value="SPRINTER">SPRINTER</option>
            <option value="VAGONETA">VAGONETA</option>
          </select>
          <input 
            type="text" 
            placeholder="Buscar por ruta" 
            value={filtro.ruta} 
            onChange={e => setFiltro(f => ({ ...f, ruta: e.target.value }))}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          />
          <input 
            type="date" 
            value={filtro.fecha} 
            onChange={e => setFiltro(f => ({ ...f, fecha: e.target.value }))}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          />
        </div>

        {/* Información de paginación */}
        {filtradas.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            padding: '0.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <span style={{ color: '#6F2234', fontWeight: '600' }}>
              Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filtradas.length)} de {filtradas.length} programaciones
            </span>
          </div>
        )}

        {/* Tabla de programaciones */}
        {filtradas.length === 0 ? (
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
                  {currentItems.map((p, index) => (
                    <React.Fragment key={p._id || index}>
                      <tr style={{ 
                        background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {formatDate(p.fechaCreacion)}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#6F2234' }}>
                          {p.ruta}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {p.tipoVehiculo}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {p.cantidadUnidades}
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
                            {p.horaSalida}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleRowExpansion(p._id)}
                            style={{
                              background: expandedRows.has(p._id) ? '#8B2E3F' : '#6F2234',
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
                            {expandedRows.has(p._id) ? '🔽 Ocultar' : '🔍 Ver'}
                          </button>
                        </td>
                      </tr>
                      {/* Fila expandible con detalles */}
                      {(expandedRows.has(p._id) || collapsingRows.has(p._id)) && (
                        <tr 
                          className={`expandable-row ${collapsingRows.has(p._id) ? 'collapsing' : 'expanded'}`}
                          style={{ 
                            background: '#f8f9fa'
                          }}
                        >
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
                                <div><strong>Ruta:</strong> {p.ruta}</div>
                                <div><strong>Tipo de Vehículo:</strong> {p.tipoVehiculo}</div>
                                <div><strong>Cantidad de Unidades:</strong> {p.cantidadUnidades}</div>
                                <div><strong>Intervalo:</strong> {p.intervalo} minutos</div>
                                <div><strong>Corrida Inicial:</strong> {p.corridaInicial}</div>
                                <div><strong>Corrida Final:</strong> {p.corridaFinal}</div>
                                <div><strong>Hora de Salida:</strong> {p.horaSalida}</div>
                                <div><strong>Programador:</strong> {p.programador || '-'}</div>
                                <div><strong>Estado:</strong> 
                                  <span style={{ 
                                    background: p.estado === 'activo' ? '#28a745' : '#dc3545',
                                    color: '#fff',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    marginLeft: '0.5rem',
                                    fontSize: '0.85rem'
                                  }}>
                                    {p.estado || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              {p.horarios && p.horarios.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                  <h5 style={{ color: '#6F2234', marginBottom: '0.5rem' }}>Horarios Generados:</h5>
                                  <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '0.5rem' 
                                  }}>
                                    {p.horarios.map((horario, idx) => (
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            
            {getPageNumbers().map((pageNumber, index) => (
              <button
                key={index}
                onClick={() => typeof pageNumber === 'number' ? paginate(pageNumber) : null}
                className={currentPage === pageNumber ? 'active' : ''}
                disabled={pageNumber === '...'}
                style={pageNumber === '...' ? { cursor: 'default' } : {}}
              >
                {pageNumber}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProgramacionesGuardadas;
