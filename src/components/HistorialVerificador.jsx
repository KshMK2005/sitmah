import React, { useEffect, useState } from 'react';
import NavbarVerificador from './NavbarVerificador';
import { aperturaService } from '../services/api';
import '../Apertura.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [filtroFecha, setFiltroFecha] = useState(null);
  const [filtroOperador, setFiltroOperador] = useState('');
  const [filtroRuta, setFiltroRuta] = useState('');
  const [filtroUnidades, setFiltroUnidades] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const cargarAperturas = async () => {
      try {
        const data = await aperturaService.getAll();
        // Mostrar solo verificadas (dashboard/cancelado). Las regresadas van a 'pendiente' y no deben verse aquí
        setAperturas(data.filter(ap => ['dashboard', 'cancelado'].includes(ap.estado)));
      } catch (error) {
        setAperturas([]);
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

  // Función para regresar apertura a verificación
  const handleRegresarAVerificacion = async (ap) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Regresar a Verificación',
        html: `
           <div style="text-align:left;margin-bottom:1rem;">
            <label style="display:block;margin-bottom:6px;"><strong>Unidad:</strong><input id="swal-unidad" type="text" value="${ap.economico ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
            <label style="display:block;margin-bottom:6px;"><strong>Ruta:</strong><input id="swal-ruta" type="text" value="${ap.ruta ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
            <label style="display:block;margin-bottom:6px;"><strong>Operador:</strong><input id="swal-operador" type="text" value="${ap.nombre ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
            <label style="display:block;margin-bottom:6px;"><strong>Tarjetón:</strong><input id="swal-tarjeton" type="text" value="${ap.tarjeton ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
            <label style="display:block;margin-bottom:6px;"><strong>Hora Programada:</strong><input id="swal-horaprogramada" type="time" value="${ap.horaProgramada ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
             <label style="display:block;margin-bottom:6px;"><strong>Hora de Salida:</strong><input id="swal-horasalida" type="time" value="${ap.horaSalida ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
             <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
               <label style="display:block;margin-bottom:6px;"><strong>Corrida Inicial:</strong><input id="swal-corrida-inicial" type="number" value="${ap.corridaInicial ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
               <label style="display:block;margin-bottom:6px;"><strong>Corrida Final:</strong><input id="swal-corrida-final" type="number" value="${ap.corridaFinal ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
               <label style="display:block;margin-bottom:6px;"><strong>Intervalo:</strong><input id="swal-intervalo" type="number" value="${ap.intervalo ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
             </div>
            <label style="display:block;margin-bottom:6px;"><strong>Tipo Unidad:</strong><input id="swal-tipounidad" type="text" value="${ap.tipoUnidad ?? ''}" style="width:100%;padding:4px;margin-top:4px;border:1px solid #ccc;border-radius:4px;"/></label>
          </div>
          <textarea id="swal-motivo-regreso" placeholder="Especifica el motivo del regreso (falla técnica, llanta ponchada, etc.)..." style="width:100%;min-height:100px;padding:8px;border:1px solid #ccc;border-radius:4px;resize:vertical;"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const unidad = document.getElementById('swal-unidad').value.trim();
          const ruta = document.getElementById('swal-ruta').value.trim();
          const operador = document.getElementById('swal-operador').value.trim();
          const tarjeton = document.getElementById('swal-tarjeton').value.trim();
          const horaProgramada = document.getElementById('swal-horaprogramada').value;
          const horaSalida = (document.getElementById('swal-horasalida')?.value || '').trim();
          const corridaInicial = (document.getElementById('swal-corrida-inicial')?.value || '').trim();
          const corridaFinal = (document.getElementById('swal-corrida-final')?.value || '').trim();
          const intervalo = (document.getElementById('swal-intervalo')?.value || '').trim();
          const tipoUnidad = document.getElementById('swal-tipounidad').value.trim();
          const motivo = document.getElementById('swal-motivo-regreso').value.trim();
          if (!motivo) {
            Swal.showValidationMessage('Debes especificar el motivo del regreso');
            return false;
          }
          return { unidad, ruta, operador, tarjeton, horaProgramada, horaSalida, corridaInicial, corridaFinal, intervalo, tipoUnidad, motivo };
        }
      });

      if (formValues) {
        // Desestructurar valores
        const { unidad, ruta, operador, tarjeton, horaProgramada, horaSalida, corridaInicial, corridaFinal, intervalo, tipoUnidad, motivo } = formValues;

        const toHHmm = (val) => {
          if (!val) return '';
          const [h='00',m='00'] = String(val).split(':');
          return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        };

        // Construir objeto de actualización
        const updateData = {
          economico: unidad,
          ruta,
          nombre: operador,
          tarjeton,
          horaProgramada: toHHmm(horaProgramada),
          horaSalida: toHHmm(horaSalida || ap.horaSalida),
          corridaInicial: corridaInicial ? Number(corridaInicial) : ap.corridaInicial,
          corridaFinal: corridaFinal ? Number(corridaFinal) : ap.corridaFinal,
          intervalo: intervalo ? Number(intervalo) : ap.intervalo,
          tipoUnidad,
          estado: 'pendiente',
          observaciones: `REGRESO POR FALLA TÉCNICA: ${motivo}`,
          usuarioModificacion: localStorage.getItem('userName') || 'verificador',
          fechaRegreso: new Date().toISOString()
        };

        await aperturaService.update(ap._id, updateData);

        Swal.fire({
          title: '¡Regresado!',
          text: 'La unidad ha sido regresada a verificación',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Recargar datos
        const data = await aperturaService.getAll();
        setAperturas(data.filter(item => ['dashboard', 'cancelado'].includes(item.estado)));
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo regresar la unidad a verificación',
        icon: 'error'
      });
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
          <DatePicker
            selected={filtroFecha}
            onChange={(date) => setFiltroFecha(date)}
            placeholderText="Seleccionar fecha..."
            dateFormat="dd/MM/yyyy"
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
            type="text"
            placeholder="Buscar por operador..."
            value={filtroOperador}
            onChange={e => setFiltroOperador(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />
          <input
            type="text"
            placeholder="Buscar por ruta..."
            value={filtroRuta}
            onChange={e => setFiltroRuta(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '2px solid #e0e0e0',
              background: '#fff',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />
          <input
            type="text"
            placeholder="Buscar por unidades..."
            value={filtroUnidades}
            onChange={e => setFiltroUnidades(e.target.value)}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, aperturasFiltradas.length)} de {aperturasFiltradas.length} verificaciones
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

        {/* Tabla de verificaciones */}
        {currentAperturas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem', 
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => handleRegresarAVerificacion(ap)}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Regresar a verificación por falla técnica"
            >
              🔄 Regresar
            </button>
            <button
              onClick={() => toggleRowExpansion(ap._id)}
              style={{
                background: expandedRows.has(ap._id) ? '#8B2E3F' : '#6F2234',
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
              {expandedRows.has(ap._id) ? '🔽 Ocultar' : '✏ Editar'}
            </button>
          </div>
                  </div>

                  {/* Detalles expandibles */}
                  {expandedRows.has(ap._id) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '0.4rem',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      padding: '0.4rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '3px'
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

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginTop: '2rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #6F2234',
                background: currentPage === 1 ? '#f8f9fa' : '#6F2234',
                color: currentPage === 1 ? '#6F2234' : '#fff',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              ← Anterior
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #6F2234',
                  background: page === currentPage ? '#6F2234' : '#fff',
                  color: page === currentPage ? '#fff' : '#6F2234',
                  borderRadius: '4px',
                  cursor: page === '...' ? 'default' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  minWidth: '2.5rem'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #6F2234',
                background: currentPage === totalPages ? '#f8f9fa' : '#6F2234',
                color: currentPage === totalPages ? '#6F2234' : '#fff',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default HistorialVerificador;
