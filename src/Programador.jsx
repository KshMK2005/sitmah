import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        cargarProgramaciones();
    }, []);

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
                <div className="apertura-form modern-form" style={{ width: '100%', maxWidth: 700, margin: '0 auto 2rem auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2.5rem', justifyContent: 'center' }}>
                    <h2 style={{textAlign:'center',marginBottom:'1.5rem'}}>Nueva Programación</h2>
                    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
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
                        <div className="form-actions" style={{display:'flex',flexDirection:'column',gap:'1rem',marginTop:'1.5rem'}}>
                            <button type="button" onClick={generarHorarios} className="btn-apertura">Generar Horarios</button>
                            <button type="submit" className="btn-apertura">Guardar Programación</button>
                        </div>
                    </form>
                </div>
                {formData.horarios && formData.horarios.length > 0 && (
                    <div className="horarios-preview" style={{overflowX:'auto', width:'100%', marginTop:'2rem'}}>
                        <h3>Horarios Generados</h3>
                        <div className="horarios-list" style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',minWidth:'300px'}}>
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
