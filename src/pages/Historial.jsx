import React, { useState, useEffect } from 'react';
import { applySavedTheme } from '../utils/theme';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { aperturaService } from '../services/api';
import '../Apertura.css';
import { useTransition } from '../components/TransitionContext';
import './Historial.css';

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

  return (
    <div className="apertura-page">
      {!adminMode && (!role || role !== 'administrador') && <Navbar />}
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h2 className="historial-titulo">
          Aperturas Guardadas
        </h2>
        <button
          style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1rem', boxShadow: (mostrarFiltros ? '0 2px 8px #CBB26A88' : 'none'), transition: 'box-shadow 0.2s' }}
          onClick={() => setMostrarFiltros(f => !f)}
        >
          {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        {mostrarFiltros && (
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
              Año:
              <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Todos</option>
                {Array.from(new Set(aperturas.map(ap => ap.fechaApertura && (new Date(ap.fechaApertura).getFullYear())))).filter(Boolean).sort((a, b) => b - a).map(anio => (
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
        {Object.keys(aperturasAgrupadas).length === 0 ? (
          <div className="archivo-uploader">
            <p style={{ color: '#6F2234', fontSize: '1.1rem', margin: 0 }}>
              No hay aperturas guardadas para este periodo.
            </p>
          </div>
        ) : (
          Object.entries(aperturasAgrupadas).map(([dia, aperturasDelDia]) => (
            <div key={dia} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#6F2234', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Día: {dia}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {aperturasDelDia.map((ap, idx) => (
                  <div key={ap._id || idx} className="apertura-card" style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    minWidth: 250,
                    flex: '1 1 250px',
                    fontSize: '0.98rem',
                  }}>
                    <div><strong style={{ color: '#6F2234' }}>Ruta:</strong> {ap.ruta}</div>
                    <div><strong style={{ color: '#6F2234' }}>Tipo Unidad:</strong> {ap.tipoUnidad}</div>
                    <div><strong style={{ color: '#6F2234' }}>Económico:</strong> {ap.economico}</div>
                    <div><strong style={{ color: '#6F2234' }}>Tarjetón:</strong> {ap.tarjeton}</div>
                    <div><strong style={{ color: '#6F2234' }}>Nombre:</strong> {ap.nombre}</div>
                    <div><strong style={{ color: '#6F2234' }}>Corrida Inicial:</strong> {ap.corridaInicial}</div>
                    <div><strong style={{ color: '#6F2234' }}>Corrida Final:</strong> {ap.corridaFinal}</div>
                    <div><strong style={{ color: '#6F2234' }}>Hora Salida:</strong> {ap.horaSalida}</div>
                    <div><strong style={{ color: '#6F2234' }}>Estado:</strong> {ap.estado}</div>
                    <div><strong style={{ color: '#6F2234' }}>Fecha Apertura:</strong> {ap.fechaApertura ? (new Date(ap.fechaApertura).toLocaleDateString()) : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <button
          style={{ marginTop: '1.5rem', background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          onClick={() => navigateWithTransition('/horarios')}
        >
          Volver a Horarios
        </button>
      </main>
    </div>
  );
}

export default Historial;