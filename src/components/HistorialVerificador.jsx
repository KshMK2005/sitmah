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
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
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

  // Filtrar aperturas por año, mes, día y nombre
  const aperturasFiltradas = aperturas.filter(ap => {
    if (!ap.fechaApertura) return false;
    const fecha = new Date(ap.fechaApertura);
    const cumpleAnio = filtroAnio ? (fecha.getFullYear().toString() === filtroAnio) : true;
    const cumpleMes = filtroMes ? ((fecha.getMonth() + 1).toString().padStart(2, '0') === filtroMes) : true;
    const cumpleDia = filtroDia ? (fecha.getDate().toString().padStart(2, '0') === filtroDia) : true;
    const cumpleNombre = filtroNombre ? (ap.nombre && ap.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) : true;
    return cumpleAnio && cumpleMes && cumpleDia && cumpleNombre;
  });

  // Generar días disponibles basados en el mes seleccionado
  const getDiasDisponibles = () => {
    if (!filtroAnio || !filtroMes) return [];
    const diasEnMes = new Date(parseInt(filtroAnio), parseInt(filtroMes), 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => (i + 1).toString().padStart(2, '0'));
  };

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
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            onChange={e => {
              setFiltroAnio(e.target.value);
              setFiltroMes('');
              setFiltroDia('');
            }}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">Todos los años</option>
            {Array.from(new Set(aperturas.map(ap => ap.fechaApertura && (new Date(ap.fechaApertura).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
          <select 
            value={filtroMes} 
            onChange={e => {
              setFiltroMes(e.target.value);
              setFiltroDia('');
            }}
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
          <select 
            value={filtroDia} 
            onChange={e => setFiltroDia(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">Todos los días</option>
            {getDiasDisponibles().map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />
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
          <div className="table-container">
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
                        {ap.estado === 'cancelado' ? 'Rechazado' :
                         ap.estado === 'dashboard' ? 'Aprobado' :
                         ap.estado === 'retrasado' ? 'Retrasado' :
                         ap.estado === 'completado' ? 'Completado' : ap.estado}
                      </span>
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
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {expandedRows.has(ap._id) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '1rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
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
                          Ruta
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.ruta}
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
                          Operador
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.nombre}
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
                          Hora de Salida
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.horaSalida}
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
                            {ap.estado === 'cancelado' ? 'Rechazado' :
                             ap.estado === 'dashboard' ? 'Aprobado' :
                             ap.estado === 'retrasado' ? 'Retrasado' :
                             ap.estado === 'completado' ? 'Completado' : ap.estado}
                          </span>
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
                          Fecha Apertura
                        </div>
                        <div style={{ color: '#666' }}>
                          {formatDate(ap.fechaApertura)}
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
                          Motivo
                        </div>
                        <div style={{ color: '#666' }}>
                          {ap.estado === 'cancelado' ? (ap.observaciones || '-') : '-'}
                        </div>
                      </div>
                      {ap.retraso && (
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          border: '1px solid #eee',
                          fontSize: '0.9rem'
                        }}>
                          <div style={{ fontWeight: '500', color: '#ffc107' }}>
                            ⚠️ Retraso
                          </div>
                          <div style={{ color: '#666' }}>
                            {ap.observaciones || 'Retraso detectado automáticamente'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HistorialVerificador;
