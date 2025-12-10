import React, { useEffect, useState } from 'react';
import LluviaSanValentin from '../components/LluviaSanValentin';
import { applySavedTheme } from '../utils/theme';
import { aperturaService } from '../services/api';
import Swal from 'sweetalert2';
import '../Apertura.css';

function Pendientes() {
  // Detectar tema actual
  const [tema, setTema] = useState(localStorage.getItem('temaGlobal') || 'normal');
  useEffect(() => {
    const onStorage = () => setTema(localStorage.getItem('temaGlobal') || 'normal');
    window.addEventListener('storage', onStorage);
    const observer = new MutationObserver(() => setTema(localStorage.getItem('temaGlobal') || 'normal'));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);
  // Aplica el tema global guardado al cargar la página
  useEffect(() => {
    applySavedTheme();
  }, []);
  const [aperturasPendientes, setAperturasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // Para el modal de edición
  const [form, setForm] = useState({});
  const [flashId, setFlashId] = useState(null);
  const [flashOrangeId, setFlashOrangeId] = useState(() => {
    return localStorage.getItem('flashPendienteId') || null;
  });
  useEffect(() => {
    cargarPendientes();
  }, []);

  useEffect(() => {
    if (flashOrangeId) {
      setTimeout(() => {
        setFlashOrangeId(null);
        localStorage.removeItem('flashPendienteId');
      }, 5000);
    }
  }, [flashOrangeId]);

  const cargarPendientes = async () => {
    setLoading(true);
    try {
      const data = await aperturaService.getAll();
      // Solo elementos REGRESADOS para esta sección exclusiva
      setAperturasPendientes(data.filter(ap => ap.estado === 'pendiente'));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las aperturas pendientes',
        icon: 'error'
      });
    }
    setLoading(false);
  };

  const handleEditar = (ap) => {
    setEditando(ap._id);
    setForm({ ...ap });
  };

  const handleAceptar = async (ap) => {
    try {
      // Aprobar: mover a 'dashboard' para que aparezca en dashboard/verificador
      await aperturaService.update(ap._id, { 
        estado: 'dashboard',
        usuarioModificacion: localStorage.getItem('userName') || 'verificador'
      });
      setFlashId(ap._id); // Marcar para animar (verde, aunque ya no se verá porque desaparece)
      localStorage.setItem('flashAperturaId', ap._id); // Guardar para la página principal
      setTimeout(() => setFlashId(null), 5000);
      Swal.fire({ title: 'Aprobado', text: 'El registro fue enviado a verificador', icon: 'success', timer: 1200, showConfirmButton: false });
      setTimeout(() => cargarPendientes(), 500);
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo aceptar el registro', icon: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarEdicion = async () => {
    try {
      // Enviar todos los campos originales menos los que no deben actualizarse
      const { _id, createdAt, updatedAt, __v, ultimaModificacion, ...rest } = form;
      const datosAEnviar = {
        ...rest,
        // Mantener en etapa de aprobación
        estado: 'apertura',
        usuarioModificacion: localStorage.getItem('userName') || 'verificador'
      };
      await aperturaService.update(editando, datosAEnviar);
      Swal.fire({ title: 'Guardado', text: 'Registro actualizado', icon: 'success', timer: 1200, showConfirmButton: false });
      setEditando(null);
      cargarPendientes();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error' });
    }
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
  };

  // Función para actualizar la hora de salida
  const handleHoraSalidaChange = async (apId, nuevaHora) => {
    try {
      await aperturaService.update(apId, { 
        horaSalida: nuevaHora,
        usuarioModificacion: localStorage.getItem('userName') || 'verificador'
      });
      
      // Actualizar el estado local
      setAperturasPendientes(prev => prev.map(a => 
        a._id === apId ? { ...a, horaSalida: nuevaHora } : a
      ));
    } catch (error) {
      console.error('Error al actualizar hora de salida:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la hora de salida',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const aperturasOrdenadas = [...aperturasPendientes].sort((a, b) => {
    // Ordenar por fecha de creación (más reciente arriba)
    const fechaA = new Date(a.createdAt || 0);
    const fechaB = new Date(b.createdAt || 0);
    return fechaB - fechaA;
  });

  return (
    <div className="apertura-page" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {tema === 'sanvalentin' && <LluviaSanValentin />}
      <main className="apertura-content" style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ color: '#6F2234', fontSize: '2rem', fontWeight: '600', marginBottom: '2rem' }}>
          Aperturas Pendientes
        </h2>
        <div className="tabla-pendientes-responsive">
          <div className="tabla-pendientes-header">
            <div>Ruta</div>
            <div>Económico</div>
            <div>Tarjetón</div>
            <div>Corrida Inicial</div>
            <div>Salida Programada</div>
            <div>Hora Salida</div>
            <div>Operador</div>
            <div>Acciones</div>
          </div>
          <div className="table-rows" style={{ width: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6F2234' }}>Cargando...</div>
            ) : (
              aperturasPendientes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  No hay aperturas pendientes.
                </div>
              ) : (
                aperturasOrdenadas.map((ap, idx) => {
                  const esRegresada = ap.fechaRegreso || (ap.observaciones && ap.observaciones.toUpperCase().includes('REGRESO POR'));
                  return (
                   <div key={ap._id} className={`tabla-pendientes-row${esRegresada || ap.estado==='pendiente' ? ' regresada' : ''}${flashId === ap._id ? ' flash-green' : ''}${flashOrangeId === ap._id ? ' flash-orange' : ''}`}
                    style={{
                      borderBottom: idx === aperturasPendientes.length - 1 ? 'none' : ((esRegresada || ap.estado==='pendiente') ? '1px solid #ff8a80' : '1px solid #eee'),
                      background: (esRegresada || ap.estado==='pendiente') ? '#ff8a80' : '#f8d7da',
                      fontSize: '1rem',
                      transition: 'background 0.2s',
                      borderBottomLeftRadius: idx === aperturasPendientes.length - 1 ? '12px' : '0',
                      borderBottomRightRadius: idx === aperturasPendientes.length - 1 ? '12px' : '0',
                      overflow: 'hidden',
                      padding: '0.5rem 0',
                      boxShadow: idx === aperturasPendientes.length - 1 ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                      borderLeft: esRegresada ? '6px solid #b71c1c' : 'none',
                    }}
                  >
                    <div>
                      {ap.ruta}
                      {esRegresada && (
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#b71c1c', 
                          fontWeight: 700,
                          marginTop: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          🔄 REGRESADA
                        </div>
                      )}
                    </div>
                    <div>{ap.economico}</div>
                    <div>{ap.tarjeton}</div>
                    <div>{ap.corridaInicial}</div>
                    <div>{ap.horaSalida || '-'}</div>
                    <div>
                      <input
                        type="time"
                        value={ap.horaSalida || ''}
                        onChange={e => {
                          const nuevaHora = e.target.value;
                          handleHoraSalidaChange(ap._id, nuevaHora);
                        }}
                      />
                    </div>
                    <div>{ap.nombre || '-'}</div>
                    <div className="acciones-pendientes">
                      <button onClick={() => handleEditar(ap)} style={{ background: '#6F2234', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleAceptar(ap)} style={{ background: '#1bc47d', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Aceptar</button>
                    </div>
                  </div>
                );
                })
              )
            )}
          </div>
        </div>
        {/* Modal de edición */}
        {editando && (
          <div className="modal-edicion-pendientes" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 2px 12px #6F2234a0', maxWidth: 500 }}>
              <h3 style={{ color: '#6F2234', marginBottom: 18 }}>Editar Apertura</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label htmlFor="ruta">Ruta</label>
                <input name="ruta" value={form.ruta || ''} onChange={handleFormChange} placeholder="Ruta" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <label htmlFor="economico">Económico</label>
                <input name="economico" value={form.economico || ''} onChange={handleFormChange} placeholder="Económico" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <label htmlFor="tarjeton">Tarjetón</label>
                <input name="tarjeton" value={form.tarjeton || ''} onChange={handleFormChange} placeholder="Tarjetón" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <label htmlFor="corridaInicial">Corrida Inicial</label>
                <input name="corridaInicial" value={form.corridaInicial || ''} onChange={handleFormChange} placeholder="Corrida Inicial" type="number" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                <label htmlFor="horaSalida">Salida Programada</label>
                <input name="horaSalida" value={form.horaSalida || ''} onChange={handleFormChange} placeholder="Salida Programada" type="time" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                {form.fechaRegreso && (
                  <>
                    <label htmlFor="observaciones">Motivo de Regreso</label>
                    <textarea 
                      name="observaciones" 
                      value={form.observaciones || ''} 
                      onChange={handleFormChange} 
                      placeholder="Motivo del regreso..." 
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: '60px', resize: 'vertical' }} 
                    />
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button onClick={handleGuardarEdicion} style={{ background: '#6F2234', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                <button onClick={handleCancelarEdicion} style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Pendientes;