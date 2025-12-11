import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useTransition } from './components/TransitionContext';
import { programacionService } from './services/api';
import Swal from 'sweetalert2';
import NavbarProgramador from './components/NavbarProgramador';
import './Apertura.css';

function Programador() {
    const { navigateWithTransition } = useTransition();
    const [programaciones, setProgramaciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        'GRAN VIALE': { totalUnidades: 0, totalHorarios: 0 },
        'BOXER': { totalUnidades: 0, totalHorarios: 0 },
        'SPRINTER': { totalUnidades: 0, totalHorarios: 0 },
        'VAGONETA': { totalUnidades: 0, totalHorarios: 0 }
    });
    const [formData, setFormData] = useState({
        ruta: '',
        tipoVehiculo: '',
        numeroEconomico: '',
        cantidadUnidades: '',
        intervalo: '',
        corridaInicial: '',
        corridaFinal: '',
        horaSalida: '',
        programador: localStorage.getItem('userName') || 'sistema'
    });
    const [nuevoHorario, setNuevoHorario] = useState({
        hora: '',
        corrida: ''
    });

    const role = localStorage.getItem('userRole');
    const location = useLocation();

    // Estado para edición en bloque desde ProgramacionesGuardadas
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupEditItems, setGroupEditItems] = useState([]);
    const [loadingGroupSave, setLoadingGroupSave] = useState(false);

    useEffect(() => {
        cargarProgramaciones();
    }, []);

    // Si venimos con editGroup en location.state, abrir modal para edición en bloque
    useEffect(() => {
        try {
            const state = location && location.state;
            if (state && state.editGroup && Array.isArray(state.editGroup) && state.editGroup.length > 0) {
                setGroupEditItems(state.editGroup.map(it => ({ ...it })));
                setShowGroupModal(true);
                // limpiar state del history para evitar reapertura accidental
                if (window && window.history && window.history.replaceState) {
                    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                }
            }
        } catch (err) {
            console.error('Error procesando location.state.editGroup', err);
        }
    }, [location]);

const handleProgramFileUpload = (event) => {
    // Mostrar SweetAlert de carga inicial
    const loadingAlert = Swal.fire({
        title: 'Procesando archivo',
        html: 'Por favor espera mientras se procesa el archivo...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const file = event.target.files && event.target.files[0];
    if (!file) {
        Swal.close();
        return;
    }

    // Función para normalizar el tipo de vehículo
    const normalizarTipoVehiculo = (tipo) => {
        if (!tipo) return 'VAGONETA';
        
        const tipoNormalizado = tipo.toString().toUpperCase().trim();
        
        const mapeoTipos = {
            'GRAN VIALE': 'GRAN VIALE',
            'GRAN_VIALE': 'GRAN VIALE',
            'GRANVIALE': 'GRAN VIALE',
            'BÓXER': 'BOXER',
            'BOXER': 'BOXER',
            'ORIÓN': 'BOXER',
            'ORION': 'BOXER',
            'SPRINTER': 'SPRINTER',
            'VAGONETA': 'VAGONETA',
            'VAN': 'VAGONETA',
            'CAMIONETA': 'VAGONETA'
        };
        
        return mapeoTipos[tipoNormalizado] || 'VAGONETA';
    };

    // Función mejorada para convertir valores de tiempo a formato HH:MM
    const formatIntervalo = (valor) => {
        if (valor === null || valor === undefined || valor === '') return '00:00';
        
        // Si es un número, asumimos que son minutos
        if (typeof valor === 'number') {
            // Si el número es menor a 1, asumimos que es fracción de día (0-1)
            if (valor < 1) {
                const horas = Math.floor(valor * 24);
                const minutos = Math.round(((valor * 24) - horas) * 60);
                return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
            } 
            // Si es un número mayor, asumimos que son minutos directos
            else {
                const horas = Math.floor(valor / 60);
                const minutos = Math.round(valor % 60);
                return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
            }
        }
        
        // Si es un string con formato HH:MM
        if (typeof valor === 'string' && valor.includes(':')) {
            const [horas, minutos] = valor.split(':').map(Number);
            if (!isNaN(horas) && !isNaN(minutos)) {
                return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
            }
            return '00:00';
        }
        
        // Si es un string que puede convertirse a número
        const numValor = parseFloat(valor);
        if (!isNaN(numValor)) {
            const horas = Math.floor(numValor);
            const minutos = Math.round((numValor - horas) * 60);
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        }
        
        return '00:00';
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

            if (!rawData || rawData.length < 2) {
                throw new Error('El archivo está vacío o no contiene datos válidos');
            }

            // Encontrar la fila de encabezados
            let headerRowIndex = 0;
            for (let i = 0; i < Math.min(5, rawData.length); i++) {
                const row = rawData[i];
                if (row.some(cell => typeof cell === 'string' && cell.trim() === 'RUTA')) {
                    headerRowIndex = i;
                    break;
                }
            }

            const headerRow = rawData[headerRowIndex];
            const headerMap = {};
            const columnMapping = {};

            // Mapeo de columnas con manejo flexible
            const columnasRequeridas = [
                'RUTA', 
                'TIPO DE VEHÍCULO', 
                'CANTIDAD DE UNIDADES', 
                'KILOMETRAJE PROGRAMADO', 
                'VIAJES PROGRAMADOS', 
                'INTERVALO HR PICO', 
                'INTERVALO HR VALLE'
            ];

            // Crear mapeo de columnas
            headerRow.forEach((cell, index) => {
                if (typeof cell === 'string') {
                    const cellValue = cell.trim().toUpperCase();
                    headerMap[cellValue] = index;
                }
            });

            // Verificar columnas requeridas
            const columnasFaltantes = columnasRequeridas.filter(col => 
                !Object.keys(headerMap).some(key => 
                    key.includes(col.split(' ')[0]) // Verificación flexible
                )
            );

            if (columnasFaltantes.length > 0) {
                throw new Error(`Faltan columnas requeridas: ${columnasFaltantes.join(', ')}`);
            }

            // Mapeo flexible de columnas
            columnasRequeridas.forEach(col => {
                const colMatch = Object.keys(headerMap).find(key => 
                    key.includes(col.split(' ')[0]) // Coincidencia parcial
                );
                if (colMatch) {
                    columnMapping[col] = colMatch;
                }
            });

            // Procesar filas de datos
            const filteredRows = [];
            for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                const row = rawData[i];
                const ruta = String(row[headerMap[columnMapping['RUTA']]] || '').trim();
                const tipo = String(row[headerMap[columnMapping['TIPO DE VEHÍCULO']]] || '').trim();
                
                if (ruta && tipo) {
                    filteredRows.push({
                        RUTA: ruta,
                        TIPO_DE_VEHICULO: tipo.toUpperCase(),
                        CANTIDAD_DE_UNIDADES: parseInt(row[headerMap[columnMapping['CANTIDAD DE UNIDADES']]]) || 1,
                        KILOMETRAJE_PROGRAMADO: parseInt(row[headerMap[columnMapping['KILOMETRAJE PROGRAMADO']]]) || 0,
                        VIAJES_PROGRAMADOS: parseInt(row[headerMap[columnMapping['VIAJES PROGRAMADOS']]]) || 0,
                        INTERVALO_HR_PICO: row[headerMap[columnMapping['INTERVALO HR PICO']]],
                        INTERVALO_HR_VALLE: row[headerMap[columnMapping['INTERVALO HR VALLE']]]
                    });
                }
            }

            if (filteredRows.length === 0) {
                throw new Error('No se encontraron filas con datos válidos después de los encabezados');
            }

            // Calcular resumen
            const rutasT = filteredRows.filter(r => r.RUTA.startsWith('T-'));
            const rutasRA = filteredRows.filter(r => r.RUTA.startsWith('RA-'));
            const resumen = `Se van a importar:<br/>` +
                           `- ${rutasT.length} rutas T- (Troncales)<br/>` +
                           `- ${rutasRA.length} rutas RA- (Rutas Alimentadoras)`;

            // Cerrar el diálogo de carga inicial
            Swal.close();

            // Mostrar resumen antes de enviar
            const result = await Swal.fire({
                title: 'Confirmar Importación',
                html: resumen,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) {
                event.target.value = '';
                return;
            }

            // Mostrar SweetAlert de carga para el envío
            const sendingAlert = Swal.fire({
                title: 'Enviando datos',
                html: 'Por favor espera mientras se guardan los datos...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let success = 0;
            let errors = [];
            
            for (const row of filteredRows) {
                try {
                    const payload = {
                        ruta: row.RUTA,
                        tipoVehiculo: normalizarTipoVehiculo(row.TIPO_DE_VEHICULO),
                        cantidadUnidades: row.CANTIDAD_DE_UNIDADES,
                        kilometraje: row.KILOMETRAJE_PROGRAMADO,
                        viajesProgramados: row.VIAJES_PROGRAMADOS,
                        intervaloPico: formatIntervalo(row.INTERVALO_HR_PICO),
                        intervaloValle: formatIntervalo(row.INTERVALO_HR_VALLE),
                        programador: localStorage.getItem('userName') || 'sistema',
                        intervalo: 15,
                        corridaInicial: 1,
                        corridaFinal: 1,
                        horaSalida: '05:30',
                        numeroEconomico: `E-${row.RUTA.replace(/[^a-zA-Z0-9]/g, '')}`
                    };

                    console.log('Enviando datos al servidor:', JSON.stringify(payload, null, 2));
                    const response = await programacionService.create(payload);
                    console.log('Respuesta del servidor:', response);
                    success++;
                    
                } catch (error) {
                    let errorMessage = 'Error al crear la programación';
                    if (error.response) {
                        console.error('Error en la respuesta del servidor:', {
                            status: error.response.status,
                            data: error.response.data,
                            headers: error.response.headers
                        });
                        errorMessage = error.response.data?.message || errorMessage;
                    } else if (error.request) {
                        console.error('No se recibió respuesta del servidor:', error.request);
                        errorMessage = 'No se pudo conectar con el servidor';
                    } else {
                        console.error('Error al configurar la solicitud:', error.message);
                        errorMessage = `Error: ${error.message}`;
                    }
                    errors.push(`Error en ruta ${row.RUTA || '?'}: ${errorMessage}`);
                }
            }

            // Cerrar el SweetAlert de carga
            Swal.close();

            // Mostrar resumen final
            if (errors.length > 0) {
                await Swal.fire({
                    title: 'Proceso completado con errores',
                    html: `Se importaron ${success} registros correctamente.<br/><br/>
                          <strong>Errores (${errors.length}):</strong><br/>
                          <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
                              ${errors.map((e, i) => `${i+1}. ${e}`).join('<br/>')}
                          </div>`,
                    icon: 'warning'
                });
            } else {
                await Swal.fire({
                    title: '¡Éxito!',
                    text: `Se importaron ${success} registros correctamente.`,
                    icon: 'success'
                });
            }

            // Recargar las programaciones
            await cargarProgramaciones();

        } catch (error) {
            console.error('Error al procesar archivo:', error);
            Swal.fire({
                title: 'Error',
                html: `
                    <div style="text-align: left;">
                        <p>Error al procesar el archivo:</p>
                        <p><strong>${error.message}</strong></p>
                        <p>Por favor, verifica que el archivo tenga el formato correcto.</p>
                        <p>Columnas requeridas:</p>
                        <ul>
                            <li>RUTA</li>
                            <li>TIPO DE VEHÍCULO</li>
                            <li>CANTIDAD DE UNIDADES</li>
                            <li>KILOMETRAJE PROGRAMADO</li>
                            <li>VIAJES PROGRAMADOS</li>
                            <li>INTERVALO HR PICO</li>
                            <li>INTERVALO HR VALLE</li>
                        </ul>
                    </div>
                `,
                icon: 'error'
            });
        } finally {
            // Asegurarse de cerrar cualquier alerta de carga que pueda quedar abierta
            Swal.close();
            event.target.value = ''; // Limpiar input file
        }
    };
    reader.readAsArrayBuffer(file);
};
    const cargarProgramaciones = async () => {
        try {
            const data = await programacionService.getAll();
            setProgramaciones(data);
            calcularEstadisticas(data);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al cargar las programaciones',
                icon: 'error'
            });
        }
    };

    const calcularEstadisticas = (programaciones) => {
        const nuevasEstadisticas = {
            'GRAN VIALE': { totalUnidades: 0, totalHorarios: 0 },
            'BOXER': { totalUnidades: 0, totalHorarios: 0 },
            'SPRINTER': { totalUnidades: 0, totalHorarios: 0 },
            'VAGONETA': { totalUnidades: 0, totalHorarios: 0 }
        };

        programaciones.forEach(prog => {
            const tipo = prog.tipoVehiculo;
            if (nuevasEstadisticas[tipo]) {
                nuevasEstadisticas[tipo].totalUnidades += prog.cantidadUnidades;
                nuevasEstadisticas[tipo].totalHorarios += prog.horarios.length;
            }
        });

        setEstadisticas(nuevasEstadisticas);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHorarioChange = (e) => {
        const { name, value } = e.target;
        setNuevoHorario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generarHorarios = () => {
        const { intervalo, corridaInicial, corridaFinal, horaSalida } = formData;

        if (!intervalo || !corridaInicial || !corridaFinal || !horaSalida) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor complete todos los campos necesarios para generar horarios',
                icon: 'error'
            });
            return;
        }

        const horarios = [];
        let horaActual = new Date(`2000-01-01T${horaSalida}`);
        const corridaInicialNum = parseInt(corridaInicial);
        const corridaFinalNum = parseInt(corridaFinal);
        const intervaloNum = parseInt(intervalo);

        for (let corrida = corridaInicialNum; corrida <= corridaFinalNum; corrida++) {
            horarios.push({
                hora: horaActual.toTimeString().slice(0, 5),
                corrida: corrida,
                estado: 'pendiente'
            });
            horaActual.setMinutes(horaActual.getMinutes() + intervaloNum);
        }

        setFormData(prev => ({
            ...prev,
            horarios
        }));

        Swal.fire({
            title: 'Horarios Generados',
            text: `Se han generado ${horarios.length} horarios`,
            icon: 'success'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const programacionData = {
                ...formData,
                cantidadUnidades: parseInt(formData.cantidadUnidades),
                intervalo: parseInt(formData.intervalo),
                corridaInicial: parseInt(formData.corridaInicial),
                corridaFinal: parseInt(formData.corridaFinal),
                numeroEconomico: formData.numeroEconomico
            };

            await programacionService.create(programacionData);

            Swal.fire({
                title: 'Éxito',
                text: 'Programación guardada correctamente',
                icon: 'success'
            });

            setFormData({
                ruta: '',
                tipoVehiculo: '',
                numeroEconomico: '',
                cantidadUnidades: '',
                intervalo: '',
                corridaInicial: '',
                corridaFinal: '',
                horaSalida: '',
                programador: localStorage.getItem('userName') || 'sistema'
            });

            cargarProgramaciones();
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al guardar la programación',
                icon: 'error'
            });
        }
    };

    // Estilos responsivos en línea para el grid del formulario
    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
    };
    if (window.innerWidth >= 600) {
        gridStyles.gridTemplateColumns = '1fr 1fr';
    }

    // Estilos estandarizados para elementos del formulario
    const inputStyles = {
        width: '100%',
        height: '45px',
        padding: '0.75rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box'
    };

    const labelStyles = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#6F2234',
        fontSize: '0.95rem'
    };

    const formGroupStyles = {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '80px'
    };

    return (
        <div className="programador-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', background: '#f5f5f5' }}>
            {(!role || role !== 'administrador') && <NavbarProgramador />}
            <main className="programador-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '80vh', width: '100%', padding: '1.2rem 0.5rem 0 0.5rem', marginTop: '1.2rem' }}>
                {/* Modal para edición en bloque si navegamos desde ProgramacionesGuardadas */}
                {showGroupModal && (
                    <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
                        <div style={{ width:'95%', maxWidth:1000, background:'#fff', borderRadius:8, padding:'1rem', boxShadow:'0 6px 24px rgba(0,0,0,0.2)' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                                <h3 style={{ margin:0, color:'#6F2234' }}>Editar programaciones (grupo)</h3>
                                <button onClick={() => setShowGroupModal(false)} style={{ background:'transparent', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>✖️</button>
                            </div>
                            <div style={{ maxHeight:'60vh', overflow:'auto' }}>
                                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                    <thead>
                                        <tr style={{ background:'#f8f9fa' }}>
                                            <th style={{ padding:'0.5rem', textAlign:'left' }}>Ruta</th>
                                            <th style={{ padding:'0.5rem', textAlign:'left' }}>Tipo</th>
                                            <th style={{ padding:'0.5rem', textAlign:'center' }}>Unidades</th>
                                            <th style={{ padding:'0.5rem', textAlign:'center' }}>Hora</th>
                                            <th style={{ padding:'0.5rem', textAlign:'center' }}>Intervalo</th>
                                            <th style={{ padding:'0.5rem', textAlign:'center' }}>Corr. Ini</th>
                                            <th style={{ padding:'0.5rem', textAlign:'center' }}>Corr. Fin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupEditItems.map((it, i) => (
                                            <tr key={it._id || i} style={{ borderBottom:'1px solid #e9ecef' }}>
                                                <td style={{ padding:'0.5rem' }}>
                                                    <input value={it.ruta || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], ruta: e.target.value }; setGroupEditItems(copy); }} style={{ width:'100%', padding:'0.35rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem' }}>
                                                    <input value={it.tipoVehiculo || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], tipoVehiculo: e.target.value }; setGroupEditItems(copy); }} style={{ width:'100%', padding:'0.35rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem', textAlign:'center' }}>
                                                    <input type="number" value={it.cantidadUnidades || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], cantidadUnidades: e.target.value }; setGroupEditItems(copy); }} style={{ width:'80px', padding:'0.25rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem', textAlign:'center' }}>
                                                    <input value={it.horaSalida || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], horaSalida: e.target.value }; setGroupEditItems(copy); }} style={{ width:'100px', padding:'0.25rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem', textAlign:'center' }}>
                                                    <input value={it.intervalo || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], intervalo: e.target.value }; setGroupEditItems(copy); }} style={{ width:'80px', padding:'0.25rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem', textAlign:'center' }}>
                                                    <input value={it.corridaInicial || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], corridaInicial: e.target.value }; setGroupEditItems(copy); }} style={{ width:'80px', padding:'0.25rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                                <td style={{ padding:'0.5rem', textAlign:'center' }}>
                                                    <input value={it.corridaFinal || ''} onChange={e => { const copy = [...groupEditItems]; copy[i] = { ...copy[i], corridaFinal: e.target.value }; setGroupEditItems(copy); }} style={{ width:'80px', padding:'0.25rem', borderRadius:4, border:'1px solid #ddd' }} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginTop:'0.75rem' }}>
                                <button onClick={() => { setShowGroupModal(false); }} style={{ padding:'0.5rem 0.9rem', borderRadius:6, border:'1px solid #ccc', background:'#fff', cursor:'pointer' }} disabled={loadingGroupSave}>Cancelar</button>
                                <button onClick={async () => {
                                    if (!window.confirm('¿Guardar cambios para estas programaciones?')) return;
                                    setLoadingGroupSave(true);
                                    try {
                                        await Promise.all(groupEditItems.map(item => programacionService.update(item._id, {
                                            ruta: item.ruta,
                                            tipoVehiculo: item.tipoVehiculo,
                                            cantidadUnidades: parseInt(item.cantidadUnidades) || 0,
                                            horaSalida: item.horaSalida,
                                            intervalo: parseInt(item.intervalo) || 0,
                                            corridaInicial: parseInt(item.corridaInicial) || 0,
                                            corridaFinal: parseInt(item.corridaFinal) || 0,
                                        })));
                                        await cargarProgramaciones();
                                        setShowGroupModal(false);
                                        setGroupEditItems([]);
                                    } catch (err) {
                                        console.error(err);
                                        Swal.fire('Error', 'Error al guardar cambios en las programaciones', 'error');
                                    } finally {
                                        setLoadingGroupSave(false);
                                    }
                                }} style={{ padding:'0.5rem 0.9rem', borderRadius:6, border:'none', background:'#6F2234', color:'#fff', cursor:'pointer' }} disabled={loadingGroupSave}>{loadingGroupSave ? 'Guardando...' : 'Guardar cambios'}</button>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ width: '100%', maxWidth: 700, margin: '0 auto 1rem auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button type="button" onClick={() => document.getElementById('progFileInput').click()} className="btn-apertura">📥 Cargar Excel Programación</button>
                        <input id="progFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={handleProgramFileUpload} style={{ display: 'none' }} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0', maxWidth: '600px', textAlign: 'center' }}>
                        💡 Columnas esperadas en Excel: Ruta | Tipo Vehículo | Número Económico | Cantidad Unidades | Intervalo (min) | Número Corridas
                    </p>
                </div>
                <div className="apertura-form modern-form" style={{ width: '100%', maxWidth: 700, margin: '0 auto 2rem auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2.5rem', justifyContent: 'center' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Nueva Programación</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-grid-2col" style={gridStyles}>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Ruta</label>
                                <input
                                    type="text"
                                    name="ruta"
                                    value={formData.ruta}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: Ruta 1"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Tipo de Vehículo</label>
                                <select
                                    name="tipoVehiculo"
                                    value={formData.tipoVehiculo}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyles}
                                >
                                    <option value="">Seleccione un tipo</option>
                                    <option value="GRAN VIALE">GRAN VIALE</option>
                                    <option value="BOXER">BOXER</option>
                                    <option value="SPRINTER">SPRINTER</option>
                                    <option value="VAGONETA">VAGONETA</option>
                                </select>
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Número Económico</label>
                                <input
                                    type="text"
                                    name="numeroEconomico"
                                    value={formData.numeroEconomico}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: 1234"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Cantidad de Unidades</label>
                                <input
                                    type="number"
                                    name="cantidadUnidades"
                                    value={formData.cantidadUnidades}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="Ej: 5"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Intervalo (minutos)</label>
                                <input
                                    type="number"
                                    name="intervalo"
                                    value={formData.intervalo}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="Ej: 10"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Corrida Inicial</label>
                                <input
                                    type="number"
                                    name="corridaInicial"
                                    value={formData.corridaInicial}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="Ej: 1"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Corrida Final</label>
                                <input
                                    type="number"
                                    name="corridaFinal"
                                    value={formData.corridaFinal}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="Ej: 10"
                                    style={inputStyles}
                                />
                            </div>
                            <div className="form-group" style={formGroupStyles}>
                                <label style={labelStyles}>Hora de Salida</label>
                                <input
                                    type="time"
                                    name="horaSalida"
                                    value={formData.horaSalida}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyles}
                                />
                            </div>
                        </div>
                        <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <button type="button" onClick={generarHorarios} className="btn-apertura">Generar Horarios</button>
                            <button type="submit" className="btn-apertura">Guardar Programación</button>
                        </div>
                    </form>
                </div>
                {formData.horarios && formData.horarios.length > 0 && (
                    <div className="horarios-preview" style={{ overflowX: 'auto', width: '100%', marginTop: '2rem' }}>
                        <h3>Horarios Generados</h3>
                        <div className="horarios-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minWidth: '300px' }}>
                            {formData.horarios.map((horario, index) => (
                                <div key={index} className="horario-badge">
                                    {horario.hora} - Corrida {horario.corrida}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Programador;
