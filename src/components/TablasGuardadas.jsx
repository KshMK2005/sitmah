import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Apertura.css';
import Swal from 'sweetalert2';
import Navbar from './Navbar';
import { aperturaService } from '../services/api';
import { useTransition } from './TransitionContext';

function TablasGuardadas() {
    const navigate = useNavigate();
    const { navigateWithTransition } = useTransition();
    const [tablasCombinadas, setTablasCombinadas] = useState([]);
    const [aperturas, setAperturas] = useState([]);
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroRuta, setFiltroRuta] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [ultimoReinicio, setUltimoReinicio] = useState(null);

    useEffect(() => {
        verificarReinicioDiario();
        const tablas = JSON.parse(localStorage.getItem('tablasCombinadas') || '[]');
        setTablasCombinadas(tablas);
    }, []);

    // Función para verificar si es necesario reiniciar diariamente
    const verificarReinicioDiario = () => {
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        
        const ultimoReinicioGuardado = localStorage.getItem('ultimoReinicioTablasGuardadas');
        
        if (!ultimoReinicioGuardado || new Date(ultimoReinicioGuardado) < hoy) {
            // Es un nuevo día, reiniciar
            reiniciarTablasDiario();
            localStorage.setItem('ultimoReinicioTablasGuardadas', ahora.toISOString());
            setUltimoReinicio(ahora);
        } else {
            setUltimoReinicio(new Date(ultimoReinicioGuardado));
        }
    };

    // Función para reiniciar las tablas diariamente
    const reiniciarTablasDiario = () => {
        try {
            // Limpiar tablas del día anterior
            const tablasActuales = JSON.parse(localStorage.getItem('tablasCombinadas') || '[]');
            const hoy = new Date();
            const tablasHoy = tablasActuales.filter(tabla => {
                if (!tabla.fechaCreacion) return false;
                const fechaTabla = new Date(tabla.fechaCreacion);
                return fechaTabla.toDateString() === hoy.toDateString();
            });
            
            localStorage.setItem('tablasCombinadas', JSON.stringify(tablasHoy));
            setTablasCombinadas(tablasHoy);
            
            console.log('Reinicio diario de tablas guardadas ejecutado');
        } catch (error) {
            console.error('Error en reinicio diario:', error);
        }
    };

    useEffect(() => {
        const cargarAperturas = async () => {
            try {
                const data = await aperturaService.getAll();
                const hoy = new Date().toLocaleDateString();
                const aperturasHoy = data.filter(ap => ap.fechaApertura && (new Date(ap.fechaApertura).toLocaleDateString() === hoy));
                setAperturas(aperturasHoy);
            } catch (error) {
                console.error("Error al cargar aperturas:", error);
            }
        };
        cargarAperturas();
    }, []);

    // Filtros de año y mes para las tablas guardadas
    const aniosDisponibles = Array.from(new Set(tablasCombinadas.map(tabla => tabla.fechaCreacion && (new Date(tabla.fechaCreacion).getFullYear())))).filter(Boolean).sort((a, b) => b - a);
    const mesesDisponibles = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, '0'));

    // Filtrar tablas por año, mes, nombre y ruta
    const tablasFiltradas = tablasCombinadas.filter(tabla => {
        if (!tabla.fechaCreacion) return false;
        const fecha = new Date(tabla.fechaCreacion);
        const cumpleAnio = filtroAnio ? (fecha.getFullYear().toString() === filtroAnio) : true;
        const cumpleMes = filtroMes ? ((fecha.getMonth() + 1).toString().padStart(2, '0') === filtroMes) : true;
        const cumpleNombre = filtroNombre ? (tabla.nombre && tabla.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) : true;
        const cumpleRuta = filtroRuta ? (tabla.horarios && tabla.horarios.some(h => h.ruta && h.ruta.toLowerCase().includes(filtroRuta.toLowerCase()))) : true;
        return cumpleAnio && cumpleMes && cumpleNombre && cumpleRuta;
    });

    // Calcular paginación
    const totalPages = Math.ceil(tablasFiltradas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTablas = tablasFiltradas.slice(startIndex, endIndex);

    // Resetear a la primera página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [filtroAnio, filtroMes, filtroNombre, filtroRuta]);

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

    const handleVerTabla = (tablaId) => {
        navigateWithTransition('/tabla-completa', {
            state: { tablaId }
        });
    };

    const handleBorrarTabla = (tablaId) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará toda la tabla y no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6F2234",
            cancelButtonColor: "#CBB26A",
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                const nuevasTablas = tablasCombinadas.filter((t) => t.id !== tablaId);
                setTablasCombinadas(nuevasTablas);
                localStorage.setItem('tablasCombinadas', JSON.stringify(nuevasTablas));
                Swal.fire({
                    title: "¡Borrado!",
                    text: "La tabla ha sido eliminada",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const role = localStorage.getItem('userRole');

    return (
        <div className="tablas-guardadas-page">
            {role !== 'administrador' && <Navbar />}
            <main className="apertura-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* Indicador de reinicio diario */}
                {ultimoReinicio && (
                    <div style={{ 
                        background: '#e8f5e8', 
                        border: '1px solid #28a745', 
                        borderRadius: '8px', 
                        padding: '0.75rem', 
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ color: '#28a745', fontWeight: '600' }}>
                            📅 Último reinicio diario: {ultimoReinicio.toLocaleDateString('es-MX')} - Solo se muestran elementos del día actual
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#6F2234', fontSize: '1.8rem', margin: 0 }}>
                        Tablas Guardadas (Diarias)
                    </h2>
                    <button
                        style={{ background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: (mostrarFiltros ? '0 2px 8px #CBB26A88' : 'none'), transition: 'box-shadow 0.2s' }}
                        onClick={() => setMostrarFiltros(f => !f)}
                    >
                        {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
                    </button>
                </div>
                {mostrarFiltros && (
                    <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
                            Año:
                            <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">Todos</option>
                                {aniosDisponibles.map(anio => (
                                    <option key={anio} value={anio}>{anio}</option>
                                ))}
                            </select>
                        </label>
                        <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
                            Mes:
                            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">Todos</option>
                                {mesesDisponibles.map((mes, i) => (
                                    <option key={mes} value={mes}>{new Date(0, i).toLocaleString('es-MX', { month: 'long' })}</option>
                                ))}
                            </select>
                        </label>
                        <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
                            Nombre:
                            <input
                                type="text"
                                value={filtroNombre}
                                onChange={e => setFiltroNombre(e.target.value)}
                                placeholder="Buscar por nombre"
                                style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </label>
                        <label style={{ color: '#6F2234', fontWeight: 'bold' }}>
                            Ruta:
                            <input
                                type="text"
                                value={filtroRuta}
                                onChange={e => setFiltroRuta(e.target.value)}
                                placeholder="Buscar por ruta"
                                style={{ marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}
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
                        Mostrando {startIndex + 1}-{Math.min(endIndex, tablasFiltradas.length)} de {tablasFiltradas.length} tablas del día
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

                <div className="table-container">
                    {currentTablas.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                            {currentTablas.map((tabla) => (
                                <div key={tabla.id} style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee'
                                }}>
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
                                                {tabla.nombre || `Tabla del ${new Date(tabla.fechaCreacion).toLocaleDateString()}`}
                                            </h3>
                                            <p style={{
                                                color: '#666',
                                                margin: 0,
                                                fontSize: '0.9rem'
                                            }}>
                                                {tabla.horarios?.length || 0} horarios registrados
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                className="btn-submit"
                                                onClick={() => handleVerTabla(tabla.id)}
                                            >
                                                Ver Tabla
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleBorrarTabla(tabla.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
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
                                        {tabla.horarios?.map((horario, index) => (
                                            <div key={index} style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#fff',
                                                borderRadius: '4px',
                                                border: '1px solid #eee',
                                                fontSize: '0.9rem'
                                            }}>
                                                <div style={{ fontWeight: '500', color: '#6F2234' }}>
                                                    {horario.ruta}
                                                </div>
                                                <div style={{ color: '#666' }}>
                                                    {horario.fecha} - {horario.horaSalida}
                                                </div>
                                                {horario.intervalo && (
                                                    <div style={{ color: '#666', fontSize: '0.85rem' }}>
                                                        Intervalo: {horario.intervalo}
                                                    </div>
                                                )}
                                                {horario.corridaIni && horario.corridaFin && (
                                                    <div style={{ color: '#666', fontSize: '0.85rem' }}>
                                                        Corridas: {horario.corridaIni}-{horario.corridaFin}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="archivo-uploader">
                            <p style={{
                                color: '#6F2234',
                                fontSize: '1.1rem',
                                margin: 0
                            }}>
                                No hay tablas guardadas para el día de hoy
                            </p>
                        </div>
                    )}
                </div>

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

                <button
                    style={{ marginTop: '1.5rem', marginRight: '1rem', background: '#6F2234', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                    onClick={() => navigateWithTransition('/historial')}
                >
                    Ir a Historial
                </button>
            </main>
        </div>
    );
}

export default TablasGuardadas;