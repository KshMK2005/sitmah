import React, { useState, useEffect } from 'react';
import { programacionService } from '../services/api';
import NavbarProgramador from './NavbarProgramador';
import '../Apertura.css';

function TablasProgramador() {
    const [programaciones, setProgramaciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        'GRAN VIALE': { totalUnidades: 0, totalViajes: 0 },
        'BOXER': { totalUnidades: 0, totalViajes: 0 },
        'SPRINTER': { totalUnidades: 0, totalViajes: 0 },
        'VAGONETA': { totalUnidades: 0, totalViajes: 0 }
    });

    useEffect(() => {
        cargarProgramaciones();
    }, []);

    const cargarProgramaciones = async () => {
        try {
            const data = await programacionService.getAll();
            setProgramaciones(data);
            calcularEstadisticas(data);
        } catch (error) {
            // Manejo de error opcional
        }
    };

    const calcularEstadisticas = (programaciones) => {
        const nuevasEstadisticas = {
            'GRAN VIALE': { totalUnidades: 0, totalViajes: 0 },
            'BOXER': { totalUnidades: 0, totalViajes: 0 },
            'SPRINTER': { totalUnidades: 0, totalViajes: 0 },
            'VAGONETA': { totalUnidades: 0, totalViajes: 0 }
        };
        programaciones.forEach(prog => {
            const tipo = prog.tipoVehiculo;
            if (nuevasEstadisticas[tipo]) {
                nuevasEstadisticas[tipo].totalUnidades += prog.cantidadUnidades;
                nuevasEstadisticas[tipo].totalViajes += prog.horarios.length;
            }
        });
        setEstadisticas(nuevasEstadisticas);
    };

    const role = localStorage.getItem('userRole');

    return (
        <div className="programador-page">
            {(!role || role !== 'administrador') && <NavbarProgramador />}
            <main className="programador-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', width: '100%' }}>
                <div className="estadisticas-section" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
                    <h3 style={{ color: '#6F2234', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>Resumen de Programaciones</h3>
                    <div style={{width:'100%',overflowX:'auto'}}>
                    <table className="estadisticas-table" style={{ width: '100%', minWidth: 400, borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead>
                            <tr style={{ background: '#f4f1ec' }}>
                                <th style={{ padding: '0.9rem', color: '#6F2234', fontWeight: 700 }}>Tipo de Vehículo</th>
                                <th style={{ padding: '0.9rem', color: '#6F2234', fontWeight: 700 }}>Total Unidades</th>
                                <th style={{ padding: '0.9rem', color: '#6F2234', fontWeight: 700 }}>Total Viajes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(estadisticas).map(([tipo, stats], idx) => (
                                <tr key={tipo} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                    <td style={{ padding: '0.7rem', textAlign: 'center' }}>{tipo}</td>
                                    <td style={{ padding: '0.7rem', textAlign: 'center' }}>{stats.totalUnidades}</td>
                                    <td style={{ padding: '0.7rem', textAlign: 'center' }}>{stats.totalViajes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TablasProgramador;