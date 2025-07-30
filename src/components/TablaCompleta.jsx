import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Apertura.css';
import Navbar from './Navbar';
import { useTransition } from './TransitionContext';

function TablaCompleta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithTransition } = useTransition();
  const tablasCombinadas = JSON.parse(localStorage.getItem('tablasCombinadas') || '[]');
  const role = localStorage.getItem('userRole');

  // Obtener la tabla específica basada en el ID
  const tablaId = location.state?.tablaId;
  const tablaActual = tablasCombinadas.find(t => t.id === tablaId);

  if (!tablaActual) {
    return (
      <div className="apertura-page">
        {role !== 'administrador' && <Navbar />}
        <main className="apertura-content" style={{ padding: '1rem' }}>
          <div className="archivo-uploader" style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            margin: '1rem'
          }}>
            <p style={{ color: '#6F2234', fontSize: '1.1rem' }}>Tabla no encontrada</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tablas-guardadas-page">
      {role !== 'administrador' && <Navbar />}
      <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: '#6F2234', fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.5px' }}>
          {tablaActual.nombre || `Tabla del ${new Date(tablaActual.fechaCreacion).toLocaleDateString()}`}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
            {tablaActual.horarios.length} horarios registrados
          </p>
          <button
            className="btn-submit"
            style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            onClick={() => navigateWithTransition('/tablas-guardadas')}
          >
            Volver a Tablas Guardadas
          </button>
        </div>
        <div className="table-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            {tablaActual.horarios.map((horario, idx) => {
              const apertura = horario.apertura || {};
              return (
                <div key={idx} style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #eee',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Ruta:</strong> {horario.ruta}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Fecha:</strong> {horario.fecha}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Hora de salida:</strong> {horario.horaSalida}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Unidad:</strong> {apertura.tipoUnidad || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Tarjetón:</strong> {apertura.tarjeton || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Operador:</strong> {apertura.nombre || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Intervalo:</strong> {horario.intervalo || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Corrida Inicial:</strong> {horario.corridaIni || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Corrida Final:</strong> {horario.corridaFin || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#6F2234' }}>Comentario:</strong> {horario.comentario || '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TablaCompleta;