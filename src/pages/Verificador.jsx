// Guardar cambios de tarjetón y operador en la base de datos por fila
const handleGuardarFila = async (ap) => {
    try {
        const row = editRows[ap._id] || {};
        await aperturaService.update(ap._id, {
            ...ap,
            ruta: row.ruta ?? ap.ruta,
            economico: row.economico ?? ap.economico,
            corridaInicial: row.corridaInicial ?? ap.corridaInicial,
            horaProgramada: row.horaProgramada ?? ap.horaProgramada,
            horaSalida: row.horaSalida ?? ap.horaSalida,
            tarjeton: row.tarjeton ?? ap.tarjeton,
            nombre: row.nombre ?? ap.nombre,
            usuarioModificacion: localStorage.getItem('userName') || 'verificador'
        });
        await cargarAperturas();
        Swal.fire({
            title: '¡Guardado!',
            text: 'Los cambios se han guardado correctamente',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo guardar los cambios',
            icon: 'error'
        });
    }
};
import React, { useState, useEffect } from 'react';
import { useTransition } from './TransitionContext';
import { aperturaService } from '../services/api';
import Swal from 'sweetalert2';
import NavbarVerificador from './NavbarVerificador';
import '../Apertura.css';
import ReactDOM from 'react-dom/client';

function Verificador() {
// Mover una apertura a pendientes
const handlePendiente = async (id) => {
    try {
        await aperturaService.update(id, {
            estado: 'pendiente',
            usuarioModificacion: localStorage.getItem('userName') || 'verificador'
        });
        localStorage.setItem('flashPendienteId', id); // Para animación en Pendientes.jsx
        Swal.fire({
            title: 'Movido a pendientes',
            text: 'La apertura ha sido enviada a pendientes.',
            icon: 'info',
            timer: 1200,
            showConfirmButton: false
        });
        cargarAperturas();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo mover a pendientes',
            icon: 'error'
        });
    }
};
const { navigateWithTransition } = useTransition();
const [aperturas, setAperturas] = useState([]);
const [filtros, setFiltros] = useState({
    ruta: '',
    tipoUnidad: '',
    fecha: ''
});
const [validaciones, setValidaciones] = useState({});
const [aperturaVerificando, setAperturaVerificando] = useState(null); // NUEVO estado para el modal
const [editando, setEditando] = useState(null);
const [form, setForm] = useState({});
const [flashId, setFlashId] = useState(() => {
    // Intentar recuperar el último flashId de localStorage
    return localStorage.getItem('flashAperturaId') || null;
});
function handleEditar(ap) {
    setEditando(ap._id);
    setForm({ ...ap });
}
async function handleFormChange(e) {
    const { name, value } = e.target;
    // Si se edita el tarjetón, buscar el operador automáticamente
    if (name === 'tarjeton') {
        setForm(prev => ({ ...prev, tarjeton: value }));
        if (value.trim() !== '') {
            try {
                const { operadorService } = await import('../services/operadores');
                const operador = await operadorService.buscarPorTarjeton(value);
                setForm(prev => ({ ...prev, nombre: operador?.nombre || 'NO SE ENCONTRÓ' }));
            } catch {
                setForm(prev => ({ ...prev, nombre: 'NO SE ENCONTRÓ' }));
            }
        } else {
            setForm(prev => ({ ...prev, nombre: '' }));
        }
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
}
async function handleGuardarEdicion() {
    try {
        const { _id, estado, ...rest } = form; // Excluir estado para no cambiarlo
        // Buscar operador por tarjetón antes de guardar, pero permitir guardar aunque no exista
        let operador = null;
        try {
            const { operadorService } = await import('../services/operadores');
            operador = await operadorService.buscarPorTarjeton(rest.tarjeton);
        } catch (err) {
            // No bloquear el guardado si no existe operador
            operador = null;
        }
        await aperturaService.update(editando, {
            ...rest,
            nombre: operador?.nombre || rest.nombre || '-',
        });
        await cargarAperturas();
        Swal.fire({ 
            title: '¡Guardado!', 
            text: 'Los cambios se han guardado correctamente', 
            icon: 'success', 
            timer: 1500, 
            showConfirmButton: false 
        });
        setEditando(null);
        setForm({});
    } catch (error) {
        console.error('Error al guardar:', error);
        Swal.fire({ 
            title: 'Error', 
            text: error.message || 'No se pudo guardar los cambios', 
            icon: 'error' 
        });
    }
}
function handleCancelarEdicion() {
    setEditando(null);
}

useEffect(() => {
    cargarAperturas();
    // Verificar retrasos automáticamente cada minuto
    const interval = setInterval(async () => {
        try {
            await aperturaService.verificarRetrasos();
            cargarAperturas(); // Recargar para mostrar cambios
        } catch (error) {
            console.error('Error verificando retrasos:', error);
        }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
}, []);

const cargarAperturas = async () => {
    try {
        const data = await aperturaService.getAll();
        setAperturas(data);
        // Si hay un flashId en localStorage, mantenerlo por 5s y luego borrarlo
        if (localStorage.getItem('flashAperturaId')) {
            setTimeout(() => {
                setFlashId(null);
                localStorage.removeItem('flashAperturaId');
            }, 5000);
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Error al cargar las aperturas',
            icon: 'error'
        });
    }
};

const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
        ...prev,
        [name]: value
    }));
};

const filtrarAperturas = () => {
    return aperturas.filter(ap => {
        // Mostrar todas las aperturas para verificación (sin validar estado)
        const cumpleRuta = !filtros.ruta || ap.ruta.toLowerCase().includes(filtros.ruta.toLowerCase());
        const cumpleTipo = !filtros.tipoUnidad || ap.tipoUnidad === filtros.tipoUnidad;
        const cumpleFecha = !filtros.fecha || new Date(ap.fechaApertura).toLocaleDateString() === new Date(filtros.fecha).toLocaleDateString();
        return cumpleRuta && cumpleTipo && cumpleFecha;
    });
};

// Función para manejar errores de estado inválido
const handleEstadoError = (ap) => {
    // Si el estado es en_verificacion pero no es válido, mostrarlo como pendiente
    if (ap.estado === 'en_verificacion') {
        return 'pendiente';
    }
    return ap.estado;
};

// Función para obtener el color de fondo según el estado
const getEstadoColor = (estado, retraso, fechaRegreso) => {
    // Si tiene fecha de regreso, es una unidad regresada por falla técnica
    if (fechaRegreso) return '#ffcdd2'; // Rojo más intenso para unidades regresadas
    
    if (retraso) return '#fff3cd'; // Amarillo claro para retrasos
    switch (estado) {
        case 'completado': return '#d4edda'; // Verde claro
        case 'pendiente': return '#f8d7da'; // Rojo claro
        case 'retrasado': return '#fff3cd'; // Amarillo claro
        case 'dashboard': return '#cce5ff'; // Azul claro
        default: return '#f8f9fa'; // Gris claro
    }
};

// Función para obtener el color del texto según el estado
const getEstadoTextColor = (estado, retraso) => {
    if (retraso) return '#856404'; // Amarillo oscuro para retrasos
    switch (estado) {
        case 'completado': return '#155724'; // Verde oscuro
        case 'pendiente': return '#721c24'; // Rojo oscuro
        case 'retrasado': return '#856404'; // Amarillo oscuro
        case 'dashboard': return '#004085'; // Azul oscuro
        default: return '#6c757d'; // Gris oscuro
    }
};

const handleAprobar = async (id) => {
    try {
        await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas aprobar esta apertura?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6F2234',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await aperturaService.update(id, {
                    estado: 'dashboard',
                    usuarioModificacion: localStorage.getItem('userName') || 'verificador'
                });
                setFlashId(id); // Marcar para animar
                setTimeout(() => setFlashId(null), 5000); // Quitar animación después de 5s
                Swal.fire({
                    title: '¡Aprobado!',
                    text: 'La apertura ha sido aprobada correctamente',
                    icon: 'success'
                });
                cargarAperturas();
            }
        });
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Error al aprobar la apertura',
            icon: 'error'
        });
    }
};

const handleRechazar = async (id) => {
    try {
        const { value: motivo } = await Swal.fire({
            title: 'Rechazar Apertura',
            html: <textarea id="swal-motivo-rechazo" class="swal2-textarea" placeholder="Escribe el motivo del rechazo..." style="min-height:100px;resize:vertical;width:100%"></textarea>,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6F2234',
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            preConfirm: () => {
                const motivo = document.getElementById('swal-motivo-rechazo').value;
                if (!motivo.trim()) {
                    Swal.showValidationMessage('Debes escribir el motivo del rechazo');
                    return false;
                }
                return motivo;
            },
            didOpen: () => {
                setTimeout(() => {
                    const textarea = document.getElementById('swal-motivo-rechazo');
                    if (textarea) textarea.focus();
                }, 100);
            }
        });

        if (motivo) {
            await aperturaService.update(id, {
                estado: 'cancelado',
                observaciones: motivo,
                usuarioModificacion: localStorage.getItem('userName') || 'verificador'
            });

            Swal.fire({
                title: 'Rechazada',
                text: 'La apertura ha sido rechazada',
                icon: 'success'
            });

            cargarAperturas();
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Error al rechazar la apertura',
            icon: 'error'
        });
    }
};

// Componente separado para el grid de verificación
function VerificacionComponentesModal({ ap, validaciones, marcarValidacion, onGuardar }) {
    const [_, setRerender] = useState(0); // Para forzar rerender
    const [comentario, setComentario] = useState(validaciones[ap._id]?.comentarioVerificacion || ap.comentarioVerificacion || '');
    const campos = [
        { label: 'Luces delanteras, traseras e internas', campo: 'Luces delanteras traseras e internas' },
        { label: 'Condiciones de neumáticos', campo: 'Condiciones de neumáticos' },
        { label: 'Funcionamiento correcto de puertas de servicio', campo: 'Funcionamiento correcto de puertas de servicio' },
        { label: 'Limpieza de unidad', campo: 'Limpieza de unidad' },
        { label: 'Carrocería y vidrios', campo: 'Carrocería y vidrios' },
        { label: 'Revisión mecánica visual', campo: 'Revisión mecánica visual' },
    ];
    
      // Ciclos perdidos
    const ciclosOptions = [
        '1', '1/2', '2', '2/2', '3', '3/2',
        '4', '4/2', '5', '5/2', '6'
    ];
    const [ciclosPerdidos, setCiclosPerdidos] = useState(validaciones[ap._id]?.ciclosPerdidos || ap.ciclosPerdidos || '');
    // Función para forzar rerender tras marcar
    const marcarYActualizar = async (apId, campo, valor) => {
        await marcarValidacion(apId, campo, valor);
        setRerender(r => r + 1);
    };
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '12px 0 0 0',
            background: '#f8f9fa',
            borderRadius: 12,
        }}>
            {/* Apartado de ciclos perdidos */}
            <div style={{ marginBottom: 18, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <label style={{ fontWeight: 600, color: '#6F2234', marginRight: 10 }}>Ciclos perdidos:</label>
                <select
                    value={ciclosPerdidos}
                    onChange={e => {
                        setCiclosPerdidos(e.target.value);
                        marcarValidacion(ap._id, 'ciclosPerdidos', e.target.value);
                    }}
                    style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
                >
                    <option value="">Selecciona...</option>
                    {ciclosOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.2rem',
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '100%',
                marginBottom: 18,
            }}>
                {/* Tarjetas de componentes */}
                {campos.map(({ label, campo }) => {
                    const valor = validaciones[ap._id]?.[campo] ?? ap.verificacionComponentes?.[campo];
                    return (
                        <div key={campo} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            padding: '0.7rem 1rem',
                            minWidth: 230,
                            maxWidth: 260,
                            fontSize: '1rem',
                            fontWeight: 500,
                            flex: '0 0 auto',
                            marginBottom: 0,
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                        }}>
                            <span style={{ color: '#6F2234', fontWeight: 600, minWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '1.01rem' }}>{label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, gap: 16, justifyContent: 'center', width: '100%' }}>
                                <button
                                    onClick={() => marcarYActualizar(ap._id, campo, 'bien')}
                                    style={{
                                        color: valor === 'bien' ? 'white' : '#6F2234',
                                        background: valor === 'bien' ? '#6F2234' : 'none',
                                        fontSize: '1.2rem',
                                        border: valor === 'bien' ? '4px solid #1bc47d' : '2px solid #b6e7b0',
                                        borderRadius: '6px',
                                        width: 44,
                                        height: 38,
                                        boxShadow: valor === 'bien' ? '0 0 0 4px #1bc47d80' : 'none',
                                        cursor: 'pointer',
                                        opacity: 1,
                                        transition: 'all 0.18s',
                                        pointerEvents: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                    }}
                                    title="Marcar como verificado"
                                >✔</button>
                                <button
                                    onClick={() => marcarYActualizar(ap._id, campo, 'mal')}
                                    style={{
                                        color: valor === 'mal' ? 'white' : '#d33',
                                        background: valor === 'mal' ? '#d33' : 'none',
                                        fontSize: '1.2rem',
                                        border: valor === 'mal' ? '4px solid #e60026' : '2px solid #f7b6b6',
                                        borderRadius: '6px',
                                        width: 44,
                                        height: 38,
                                        boxShadow: valor === 'mal' ? '0 0 0 4px #e6002680' : 'none',
                                        cursor: 'pointer',
                                        opacity: 1,
                                        transition: 'all 0.18s',
                                        pointerEvents: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                    }}
                                    title="Marcar como rechazado"
                                >❌</button>
                            </div>
                            {valor === 'bien' && <span style={{ color: '#1bc47d', marginTop: 10, fontWeight: 700, fontSize: '1.05rem', alignSelf: 'center' }}>Verificado</span>}
                            {valor === 'mal' && <span style={{ color: '#d33', marginTop: 10, fontWeight: 700, fontSize: '1.05rem', alignSelf: 'center' }}>Rechazado</span>}
                        </div>
                    );
                })}
            </div>
            {/* Solo textarea para comentario */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                marginTop: 10,
            }}>
                <textarea
                    id="comentario-verificacion"
                    placeholder="Agrega un comentario opcional..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    style={{
                        minWidth: 350,
                        maxWidth: 450,
                        minHeight: 100,
                        maxHeight: 180,
                        borderRadius: 10,
                        border: '1.5px solid #6F2234',
                        padding: '0.6rem',
                        fontSize: '1rem',
                        resize: 'vertical',
                        background: '#fff',
                        color: '#6F2234',
                        fontWeight: 500,
                        marginBottom: 10
                    }}
                />
                <button
                    onClick={() => {
                        marcarValidacion(ap._id, 'comentarioVerificacion', comentario);
                        onGuardar(ap._id);
                    }}
                    style={{
                        marginTop: 8,
                        background: '#6F2234',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.7rem 2.2rem',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px #e0e0e0',
                        transition: 'background 0.2s'
                    }}
                >Guardar</button>
            </div>
        </div>
    );
}

// useRef para mantener el root y container
const verificacionRootRef = React.useRef(null);
const verificacionContainerRef = React.useRef(null);

// useEffect para mostrar y actualizar el modal
// Función para guardar los componentes y comentario
const guardarComponentesVerificados = async (apId) => {
    const datos = validaciones[apId] || {};
    const { comentarioVerificacion, ...componentes } = datos;
    try {
        await aperturaService.update(apId, {
            verificacionComponentes: componentes,
            comentarioVerificacion: comentarioVerificacion || '',
            usuarioModificacion: localStorage.getItem('userName') || 'verificador'
        });
        Swal.fire({
            title: 'Guardado',
            text: 'Componentes y comentario guardados correctamente',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false
        });
        cargarAperturas();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar la verificación de componentes',
            icon: 'error'
        });
    }
};

useEffect(() => {
    if (aperturaVerificando) {
        if (!verificacionContainerRef.current) {
            verificacionContainerRef.current = document.createElement('div');
        }
        if (!verificacionRootRef.current) {
            verificacionRootRef.current = ReactDOM.createRoot(verificacionContainerRef.current);
        }
        // Renderizar el modal SOLO la primera vez que se abre
        verificacionRootRef.current.render(
            <VerificacionComponentesModal ap={aperturaVerificando} validaciones={validaciones} marcarValidacion={marcarValidacion} onGuardar={guardarComponentesVerificados} />
        );
        Swal.fire({
            title: '<h4 style="color:#6F2234;font-weight:700;">Verificación de componentes del autobús</h4>',
            html: verificacionContainerRef.current,
            width: 900,
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                popup: 'swal2-verificacion-componentes'
            },
            willClose: () => {
                if (verificacionRootRef.current) {
                    verificacionRootRef.current.unmount();
                    verificacionRootRef.current = null;
                    verificacionContainerRef.current = null;
                }
                setAperturaVerificando(null);
            }
        });
    }
    // eslint-disable-next-line
}, [aperturaVerificando]);

// Actualizar el contenido del modal cuando cambian las validaciones
useEffect(() => {
    if (aperturaVerificando && verificacionRootRef.current) {
        verificacionRootRef.current.render(
            <VerificacionComponentesModal ap={aperturaVerificando} validaciones={validaciones} marcarValidacion={marcarValidacion} onGuardar={guardarComponentesVerificados} />
        );
    }
    // eslint-disable-next-line
}, [validaciones]);

// Nueva función para mostrar el SweetAlert con los componentes
const mostrarVerificacionComponentes = (ap) => {
    setAperturaVerificando(ap);
};

// Modificar marcarValidacion para solo actualizar el estado
const marcarValidacion = async (apId, campo, valor) => {
    setValidaciones(prev => ({
        ...prev,
        [apId]: {
            ...prev[apId],
            [campo]: valor
        }
    }));
    try {
        await aperturaService.update(apId, {
            verificacionComponentes: {
                ...(validaciones[apId] || {}),
                [campo]: valor
            },
            usuarioModificacion: localStorage.getItem('userName') || 'verificador'
        });
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar la verificación de componentes',
            icon: 'error'
        });
    }
};

const aperturasFiltradas = filtrarAperturas();
const aperturasOrdenadas = [...aperturasFiltradas].sort((a, b) => {
    // Prioridad: primero los que acaban de ser aceptados (flashId), luego por fecha de modificación o creación descendente
    if (flashId && a._id === flashId) return -1;
    if (flashId && b._id === flashId) return 1;
    const fechaA = new Date(a.updatedAt || a.ultimaModificacion?.fecha || a.createdAt || 0);
    const fechaB = new Date(b.updatedAt || b.ultimaModificacion?.fecha || b.createdAt || 0);
    return fechaB - fechaA;
});
const role = localStorage.getItem('userRole');

// Calcular cantidad de aperturas pendientes
const pendientes = aperturas.filter(ap => ap.estado === 'pendiente');

// Estado para edición en línea de tarjetón y nombre
const [editRows, setEditRows] = useState({});

// Permitir edición libre y buscar operador solo al salir del input
function handleTarjetonChange(id, value) {
    setEditRows(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            tarjeton: value
        }
    }));
}

async function handleTarjetonBlur(id, value) {
    setEditRows(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            buscando: true
        }
    }));
    try {
        const { operadorService } = await import('../services/operadores');
        const operador = await operadorService.buscarPorTarjeton(value);
        setEditRows(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                nombre: operador?.nombre || '',
                buscando: false
            }
        }));
    } catch {
        setEditRows(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                nombre: 'NO SE ENCONTRÓ',
                buscando: false
            }
        }));
    }
}

// Inicializar los valores editables al cargar aperturas
useEffect(() => {
    const initial = {};
    aperturas.forEach(ap => {
        initial[ap._id] = {
            tarjeton: ap.tarjeton || '',
            nombre: ap.nombre || '',
            buscando: false
        };
    });
    setEditRows(initial);
}, [aperturas]);

return (
    <div className="apertura-page" style={{ background: '#f8f9fa' }}>
        {(!role || role !== 'administrador') && <NavbarVerificador />}
        <main className="apertura-content" style={{
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
            {/* ...filtros y encabezado igual... */}
            <div className="table-container" style={{
                width: '100%',
                overflowX: 'auto',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px 0 rgba(111,34,52,0.18), 0 1.5px 8px 0 rgba(111,34,52,0.10)',
                padding: 0,
                marginBottom: '2rem',
                border: '1px solid #ececec',
                scrollbarWidth: 'thin',
                scrollbarColor: '#6F2234 #f3f3f7'
            }}>
                <div className="table-header" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(9, 1fr)',
                    alignItems: 'center',
                    background: '#f3f3f7',
                    color: '#6F2234',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    borderBottom: '2px solid #e0e0e0',
                    minWidth: '1050px',
                    padding: '0.7rem 0',
                    overflow: 'hidden',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 0 #fff, 0 0 2px #6F2234a0'
                }}>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}></div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Ruta</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Económico</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Tarjetón</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Corrida Inicial</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Salida Programada</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Hora Salida</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Operador</div>
                    <div style={{ textAlign: 'center', color: '#6F2234' }}>Acciones</div>
                </div>
                <div className="table-rows" style={{ width: '100%' }}>
                    {aperturasOrdenadas.map((ap, idx) => (
                        <div key={ap._id} className={`table-row${flashId === ap._id ? ' flash-green' : ''}`} style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(9, 1fr)',
                            alignItems: 'center',
                            borderBottom: idx === aperturasOrdenadas.length - 1 ? 'none' : '1px solid #eee',
                            background: getEstadoColor(handleEstadoError(ap), ap.retraso, ap.fechaRegreso),
                            fontSize: '1rem',
                            minWidth: '1050px',
                            transition: 'background 0.2s',
                            borderBottomLeftRadius: idx === aperturasOrdenadas.length - 1 ? '12px' : '0',
                            borderBottomRightRadius: idx === aperturasOrdenadas.length - 1 ? '12px' : '0',
                            overflow: 'hidden',
                            padding: '0.5rem 0',
                            boxShadow: idx === aperturasOrdenadas.length - 1 ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                            cursor: 'pointer',
                            borderLeft: ap.fechaRegreso ? '4px solid #b71c1c' : (ap.retraso ? '4px solid #ffc107' : 'none'),
                        }}
                            onMouseOver={e => e.currentTarget.style.background = '#d4edda'}
                            onMouseOut={e => e.currentTarget.style.background = getEstadoColor(handleEstadoError(ap), ap.retraso, ap.fechaRegreso)}
                        >
                            <div className="table-cell" style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => mostrarVerificacionComponentes(ap)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6F2234' }}
                                    title="Verificar componentes"
                                >▼</button>
                            </div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>
                                {ap.ruta}
                                {ap.fechaRegreso && (
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        color: '#dc3545', 
                                        fontWeight: 'bold',
                                        marginTop: '2px'
                                    }}>
                                        🔄 REGRESADA
                                    </div>
                                )}
                            </div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.economico}</div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.tarjeton}</div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.corridaInicial}</div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.horaProgramada || 'N/A'}</div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.horaSalida || ''}</div>
                            <div className="table-cell" style={{ textAlign: 'center' }}>{ap.nombre || ''}</div>
                            <div className="table-cell" style={{ textAlign: 'center', display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleAprobar(ap._id)}
                                                    className="btn-edit action-btn"
                                                    style={{
                                                        background: '#6F2234',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.4rem 0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 4px #e0e0e0',
                                                        transition: 'background 0.2s',
                                                        width: '80px',
                                                        height: '32px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    title="Aprobar apertura"
                                                >Aprobar</button>
                                                <button
                                                    onClick={() => handleEditar(ap)}
                                                    className="btn-edit action-btn"
                                                    style={{
                                                        background: '#f7b731',
                                                        color: '#6F2234',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.4rem 0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 4px #e0e0e0',
                                                        transition: 'background 0.2s',
                                                        width: '80px',
                                                        height: '32px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    title="Editar apertura"
                                                >Editar</button>
                                                <button
                                                    onClick={() => handlePendiente(ap._id)}
                                                    className="btn-edit action-btn"
                                                    style={{
                                                        background: '#ff8a65',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.4rem 0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 4px #e0e0e0',
                                                        transition: 'background 0.2s',
                                                        width: '90px',
                                                        height: '32px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    title="Enviar a pendientes"
                                                >Pendientes</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Modal de edición al estilo Pendientes.jsx */}
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
                            <label htmlFor="horaProgramada">Salida Programada</label>
                            <input name="horaProgramada" value={form.horaProgramada || ''} onChange={handleFormChange} placeholder="Salida Programada" type="time" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                            <label htmlFor="horaSalida">Hora Salida</label>
                            <input name="horaSalida" value={form.horaSalida || ''} onChange={handleFormChange} placeholder="Hora Salida" type="time" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                            <label htmlFor="nombre">Operador</label>
                            <input name="nombre" value={form.nombre || ''} onChange={handleFormChange} placeholder="Nombre del operador" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
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
            {/* ...mensaje de tabla vacía igual... */}
        </main>
    </div>
);
}

export default Verificador;