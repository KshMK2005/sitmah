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
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', width:'100%' }}>
        <h2 style={{ color: '#6F2234', fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.5px' }}>
          Historial de Programaciones Guardadas
        </h2>
        <button
          style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1rem', boxShadow: (mostrarFiltros ? '0 2px 8px #CBB26A88' : 'none'), transition: 'box-shadow 0.2s' }}
          onClick={() => setMostrarFiltros(f => !f)}
        >
          {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
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
            <div key={dia} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX:'auto' }}>
              <h3 style={{ color: '#6F2234', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Día: {dia}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', minWidth:'250px' }}>
                {programacionesDelDia.map((pr, idx) => (
                  <div key={pr._id || idx} style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    minWidth: 250,
                    flex: '1 1 250px',
                    fontSize: '0.98rem',
                  }}>
                    <div><strong style={{ color: '#6F2234' }}>Ruta:</strong> {pr.ruta}</div>
                    <div><strong style={{ color: '#6F2234' }}>Tipo Vehículo:</strong> {pr.tipoVehiculo}</div>
                    <div><strong style={{ color: '#6F2234' }}>Unidades:</strong> {pr.cantidadUnidades}</div>
                    <div><strong style={{ color: '#6F2234' }}>Intervalo:</strong> {pr.intervalo}</div>
                    <div><strong style={{ color: '#6F2234' }}>Corrida Inicial:</strong> {pr.corridaInicial}</div>
                    <div><strong style={{ color: '#6F2234' }}>Corrida Final:</strong> {pr.corridaFinal}</div>
                    <div><strong style={{ color: '#6F2234' }}>Hora Salida:</strong> {pr.horaSalida}</div>
                    <div><strong style={{ color: '#6F2234' }}>Programador:</strong> {pr.programador}</div>
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
