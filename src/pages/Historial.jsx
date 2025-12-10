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
`;

function Historial({ adminMode, programadorMode }) {
  // Aplica el tema global guardado al cargar la página
  useEffect(() => {
    applySavedTheme();
  }, []);
  const navigate = useNavigate();
  const { navigateWithTransition } = useTransition();
  const [aperturas, setAperturas] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState(null);
  const [filtroOperador, setFiltroOperador] = useState('');
  const [filtroRuta, setFiltroRuta] = useState('');
  const [filtroUnidades, setFiltroUnidades] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [collapsingRows, setCollapsingRows] = useState(new Set());
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

  // Filtrar aperturas por fecha, operador, ruta y unidades
  const aperturasFiltradas = aperturas.filter(ap => {
    if (!ap.fechaApertura) return false;
    const fecha = new Date(ap.fechaApertura);
    const cumpleFecha = filtroFecha ? (fecha.toDateString() === filtroFecha.toDateString()) : true;
    const cumpleOperador = filtroOperador ? (ap.nombre && ap.nombre.toLowerCase().includes(filtroOperador.toLowerCase())) : true;
    const cumpleRuta = filtroRuta ? (ap.ruta && ap.ruta.toLowerCase().includes(filtroRuta.toLowerCase())) : true;
    const cumpleUnidades = filtroUnidades ? (ap.unidades && ap.unidades.toString().includes(filtroUnidades)) : true;
    return cumpleFecha && cumpleOperador && cumpleRuta && cumpleUnidades;
  });

  // Calcular paginación
  const totalPages = Math.ceil(aperturasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAperturas = aperturasFiltradas.slice(startIndex, endIndex);

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroFecha, filtroOperador, filtroRuta, filtroUnidades]);

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

  // Función para alternar expansión de fila con animación
  const toggleRowExpansion = (rowId) => {
    const newExpandedRows = new Set(expandedRows);
    const newCollapsingRows = new Set(collapsingRows);
    
    if (newExpandedRows.has(rowId)) {
      // Iniciar animación de cierre
      newCollapsingRows.add(rowId);
      setCollapsingRows(newCollapsingRows);
      
      // Esperar a que termine la animación antes de ocultar
      setTimeout(() => {
        newExpandedRows.delete(rowId);
        newCollapsingRows.delete(rowId);
        setExpandedRows(newExpandedRows);
        setCollapsingRows(newCollapsingRows);
      }, 300); // Duración de la animación
    } else {
      // Abrir directamente
      newExpandedRows.add(rowId);
      setExpandedRows(newExpandedRows);
    }
  };

  // Función para generar números de página
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
    <div className="apertura-page">
      <style>{animationStyles}</style>
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
              Fecha:
              <DatePicker
                selected={filtroFecha}
                onChange={(date) => setFiltroFecha(date)}
                placeholderText="Seleccionar fecha..."
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
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Unidades:
              <input
                type="text"
                placeholder="Buscar por unidades..."
                value={filtroUnidades}
                onChange={e => setFiltroUnidades(e.target.value)}
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.3rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  minWidth: '120px'
                }}
              />
            </label>
          </div>
        )}

        {/* Información de resultados y selector de elementos por página */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%', 
          marginBottom: '1rem',
          padding: '0 1rem'
        }}>
          <div style={{ color: '#6F2234', fontSize: '1rem' }}>
            Mostrando {startIndex + 1}-{Math.min(endIndex, aperturasFiltradas.length)} de {aperturasFiltradas.length} aperturas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#6F2234', fontSize: '0.9rem' }}>
              Elementos por página:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ 
                padding: '0.3rem 0.5rem', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                background: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="table-container">
          {currentAperturas.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              background: '#f8f9fa', 
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ color: '#6F2234', fontSize: '1.2rem', margin: 0 }}>
                No hay aperturas guardadas para este periodo.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.3rem' }}>
              {currentAperturas.map((ap, index) => (
                <div key={ap._id || index} style={{
                  background: '#fff',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  border: '1px solid #eee'
                }}>
                  {/* Header de la card */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div>
                      <h3 style={{
                        color: '#6F2234',
                        fontSize: '1rem',
                        margin: '0 0 0.2rem 0'
                      }}>
                        {ap.ruta} - {ap.nombre}
                      </h3>
                      <p style={{
                        color: '#666',
                        margin: 0,
                        fontSize: '0.8rem'
                      }}>
                        {formatDate(ap.fechaApertura)} - {ap.horaSalida}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ 
                        background: getEstadoColor(ap.estado), 
                        color: '#fff', 
                        padding: '0.15rem 0.3rem', 
                        borderRadius: '2px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {ap.estado}
                      </span>
                                             <button
                         onClick={() => toggleRowExpansion(ap._id || index)}
                         style={{
                           background: expandedRows.has(ap._id || index) ? '#8B2E3F' : '#6F2234',
                           color: '#fff',
                           border: 'none',
                           borderRadius: '3px',
                           padding: '0.3rem 0.6rem',
                           cursor: 'pointer',
                           fontSize: '0.75rem',
                           fontWeight: '500',
                           transition: 'all 0.2s ease'
                         }}
                       >
                         {expandedRows.has(ap._id || index) ? '🔽 Ocultar' : '🔍 Ver'}
                       </button>
                    </div>
                  </div>

                  {/* Detalles de la apertura - solo en vista normal */}
                  {(expandedRows.has(ap._id || index) || collapsingRows.has(ap._id || index)) && (
                    <div 
                      className={`expandable-row ${collapsingRows.has(ap._id || index) ? 'collapsing' : 'expanded'}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '0.4rem',
                        padding: '0.4rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '3px'
                      }}
                    >
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Tipo Unidad
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.tipoUnidad}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Económico
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.economico}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Tarjetón
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.tarjeton}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Corrida Inicial
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.corridaInicial}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Corrida Final
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.corridaFinal}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.6rem',
                        backgroundColor: '#fff',
                        borderRadius: '3px',
                        border: '1px solid #eee',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: '500', color: '#6F2234' }}>
                          Estado
                        </div>
                        <div style={{ color: '#666' }}>
                          <span style={{ 
                            background: getEstadoColor(ap.estado),
                            color: '#fff',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '3px',
                            fontSize: '0.75rem'
                          }}>
                            {ap.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navegación de páginas */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginTop: '1.5rem', 
            padding: '0.5rem 0'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ 
                background: '#6F2234', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '0.5rem 1rem', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '1rem', 
                boxShadow: '0 2px 8px rgba(111, 34, 52, 0.3)'
              }}
            >
              Anterior
            </button>
            {getPageNumbers().map((page, index) => (
              <span
                key={index}
                style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  background: currentPage === page ? '#6F2234' : '#f0f0f0',
                  color: currentPage === page ? '#fff' : '#6F2234',
                  border: '1px solid #6F2234'
                }}
                onClick={() => {
                  if (typeof page === 'number') {
                    setCurrentPage(page);
                  } else if (page === '...') {
                    // No hacer nada, ya que '...' indica saltos
                  }
                }}
              >
                {page}
              </span>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ 
                background: '#6F2234', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '0.5rem 1rem', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '1rem', 
                boxShadow: '0 2px 8px rgba(111, 34, 52, 0.3)'
              }}
            >
              Siguiente
            </button>
          </div>
        )}

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