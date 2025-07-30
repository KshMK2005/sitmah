import React, { useEffect, useState } from 'react';
import { programacionService } from '../services/api';
import NavbarProgramador from './NavbarProgramador';
import '../Apertura.css';

function ProgramacionesGuardadas() {
  const [programaciones, setProgramaciones] = useState([]);
  const [filtro, setFiltro] = useState({ tipoVehiculo: '', ruta: '', fecha: '' });
  const [filtradas, setFiltradas] = useState([]);
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
  }, [filtro, programaciones]);

  return (
    <div className="programador-page">
      {(!role || role !== 'administrador') && <NavbarProgramador />}
      <main className="programador-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: '#6F2234', fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.5px', marginTop: '3.5rem' }}>Programaciones Guardadas</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select value={filtro.tipoVehiculo} onChange={e => setFiltro(f => ({ ...f, tipoVehiculo: e.target.value }))}>
            <option value="">Tipo de Vehículo</option>
            <option value="GRAN VIALE">GRAN VIALE</option>
            <option value="BOXER">BOXER</option>
            <option value="SPRINTER">SPRINTER</option>
            <option value="VAGONETA">VAGONETA</option>
          </select>
          <input type="text" placeholder="Ruta" value={filtro.ruta} onChange={e => setFiltro(f => ({ ...f, ruta: e.target.value }))} />
          <input type="date" value={filtro.fecha} onChange={e => setFiltro(f => ({ ...f, fecha: e.target.value }))} />
        </div>
        <div className="programaciones-list" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '2rem',
          justifyItems: 'center',
          alignItems: 'stretch',
          width: '100%',
        }}>
          {filtradas.length === 0 ? (
            <div className="archivo-uploader">No hay programaciones guardadas.</div>
          ) : (
            filtradas.map(p => (
              <div key={p._id} className="programacion-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '1.5rem', minWidth: 0, width: '100%', maxWidth: 350, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                <h4 style={{ color: '#6F2234', fontSize: '1.2rem', marginBottom: '0.7rem' }}>Ruta: {p.ruta}</h4>
                <p>Tipo de Vehículo: {p.tipoVehiculo}</p>
                <p>Unidades: {p.cantidadUnidades}</p>
                <p>Intervalo: {p.intervalo} min</p>
                <p>Corridas: {p.corridaInicial} - {p.corridaFinal}</p>
                <p>Hora de Salida: {p.horaSalida}</p>
                <p>Fecha: {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : '-'}</p>
                <div className="horarios-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {p.horarios && p.horarios.map((h, i) => (
                    <div key={i} className="horario-badge" style={{ fontSize: '0.95rem', background: '#eee', borderRadius: 4, padding: '2px 8px' }}>{h.hora} - Corrida {h.corrida}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default ProgramacionesGuardadas;
