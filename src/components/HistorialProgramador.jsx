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

  return (
    <div className="apertura-page">
      {/* Mostrar el navbar solo si NO es administrador */}
      {localStorage.getItem('userRole') !== 'administrador' && <NavbarProgramador />}
      <main className="apertura-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width:'100%' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #6F2234 0%, #8B2E3F 100%)', 
          borderRadius: '16px', 
          padding: '2rem', 
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(111, 34, 52, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            letterSpacing: '1px',
            fontWeight: '700',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            📊 Historial de Programaciones
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem', 
            textAlign: 'center',
            margin: 0,
            position: 'relative',
            zIndex: 1
          }}>
            Sistema de Gestión y Control de Programaciones
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '2rem' 
        }}>
          <button
            style={{ 
              background: mostrarFiltros ? '#8B2E3F' : '#6F2234', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '1rem 2rem', 
              cursor: 'pointer', 
              fontWeight: '600', 
              fontSize: '1.1rem', 
              boxShadow: '0 4px 16px rgba(111, 34, 52, 0.3)', 
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={() => setMostrarFiltros(f => !f)}
          >
            {mostrarFiltros ? '🔽 Ocultar Filtros' : '🔼 Mostrar Filtros'}
          </button>
        </div>
        {mostrarFiltros && (
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap:'wrap' }}>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Año:
              <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Todos</option>
                {Array.from(new Set(programaciones.map(pr => pr.fechaCreacion && (new Date(pr.fechaCreacion).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </label>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Mes:
              <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Todos</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('es-MX', { month: 'long' })}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {/* Cards agrupadas por día */}
        {Object.keys(programacionesAgrupadas).length === 0 ? (
          <div className="archivo-uploader">
            <p style={{ color: '#6F2234', fontSize: '1.1rem', margin: 0 }}>
              No hay programaciones guardadas para este periodo.
            </p>
          </div>
        ) : (
          Object.entries(programacionesAgrupadas).map(([dia, programacionesDelDia]) => (
            <div key={dia} style={{ 
              marginBottom: '2rem', 
              padding: '1.5rem', 
              background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '16px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
              overflowX:'auto',
              border: '1px solid rgba(111, 34, 52, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #6F2234 0%, #8B2E3F 100%)',
                borderRadius: '12px',
                color: '#fff'
              }}>
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>📅</span>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '1.4rem', 
                  margin: 0,
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {dia}
                </h3>
                <span style={{ 
                  marginLeft: 'auto', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {programacionesDelDia.length} programación{programacionesDelDia.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {programacionesDelDia.map((pr, idx) => (
                  <div key={pr._id || idx} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(111, 34, 52, 0.1)',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(111, 34, 52, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #6F2234 0%, #8B2E3F 50%, #6F2234 100%)'
                    }}></div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '1rem',
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🚌</span>
                          <strong style={{ color: '#6F2234', fontSize: '1.1rem' }}>{pr.ruta}</strong>
                        </div>
                      </div>
                      <div><strong style={{ color: '#6F2234' }}>Tipo:</strong> {pr.tipoVehiculo}</div>
                      <div><strong style={{ color: '#6F2234' }}>Unidades:</strong> {pr.cantidadUnidades}</div>
                      <div><strong style={{ color: '#6F2234' }}>Intervalo:</strong> {pr.intervalo} min</div>
                      <div><strong style={{ color: '#6F2234' }}>Corrida I:</strong> {pr.corridaInicial}</div>
                      <div><strong style={{ color: '#6F2234' }}>Corrida F:</strong> {pr.corridaFinal}</div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ color: '#6F2234' }}>Hora Salida:</strong> 
                        <span style={{ 
                          background: '#6F2234', 
                          color: '#fff', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '6px',
                          marginLeft: '0.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {pr.horaSalida}
                        </span>
                      </div>
                      <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                        <strong style={{ color: '#6F2234' }}>Programador:</strong> 
                        <span style={{ 
                          color: '#8B2E3F', 
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}>
                          {pr.programador}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default HistorialProgramador;
