import React, { useState } from 'react';
import { useTransition } from './components/TransitionContext';
import logoSitmah from './assets/logo-sitmah.png';
import Swal from 'sweetalert2';
import { setGlobalTheme } from './utils/theme';
import { configuracionService } from './services/api';

const menuOptions = [
    {
        label: 'Apertura',
        subRoutes: [
            { label: 'Horarios', path: '/horarios' }, // Ahora apunta a la ruta que renderiza App.jsx
            { label: 'Historial Apertura', path: '/historial' },
            { label: 'Tablas Guardadas', path: '/tablas-guardadas' },
        ],
    },
    {
        label: 'Programación',
        subRoutes: [
            { label: 'Programador', path: '/programador' },
            { label: 'Tablas Programador', path: '/programador/tablas' },
            { label: 'Programaciones Guardadas', path: '/programador/guardadas' },
        ],
    },
    {
        label: 'Verificador',
        subRoutes: [
            { label: 'Verificador', path: '/verificador' },
            { label: 'Pendientes', path: '/pendientes' },
            { label: 'Historial Verificador', path: '/verificador/historial-verificador' },
        ],
    },
    {
        label: 'Dashboard',
        subRoutes: [
            { label: 'Dashboard', path: '/dashboard' },
        ],
    },
    {
        label: 'Gestión de usuarios',
        subRoutes: [
            { label: 'Gestión de usuarios', path: '/admin-usuarios' },
        ],
    },
];

function NavbarAdministrador() {
    const { navigateWithTransition } = useTransition();
    const [openMenu, setOpenMenu] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuClick = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigateWithTransition('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Función para cambiar el tema global
    const handleCambiarTema = async () => {
        // Obtener el tema actual desde la configuración global
        let temaActual = 'normal';
        try {
            const configTema = await configuracionService.getByNombre('temaGlobal');
            if (configTema && configTema.valor) {
                temaActual = configTema.valor;
            } else {
                temaActual = localStorage.getItem('temaGlobal') || 'normal';
            }
        } catch (error) {
            console.error('Error al obtener tema actual:', error);
            temaActual = localStorage.getItem('temaGlobal') || 'normal';
        }

        const result = await Swal.fire({
            title: 'Cambiar tema global de la aplicación',
            input: 'select',
            inputOptions: {
                normal: 'Normal (Tema estándar)',
                sanvalentin: 'San Valentín (Tema romántico)',
                navidad: 'Navidad (Tema festivo)',
                muertos: 'Día de Muertos (Tema tradicional)',
                grises: 'Escala de grises (Tema monocromático)'
            },
            inputPlaceholder: 'Elige un tema para toda la aplicación',
            showCancelButton: true,
            confirmButtonText: 'Aplicar Globalmente',
            cancelButtonText: 'Cancelar',
            inputValue: temaActual,
            allowOutsideClick: false,
            confirmButtonColor: '#a51d3d',
            cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed && result.value) {
            try {
                await setGlobalTheme(result.value);
                Swal.fire({
                    title: '¡Tema aplicado globalmente!',
                    text: `El tema "${result.value}" se ha aplicado a toda la aplicación y se sincronizará automáticamente con todos los usuarios en tiempo real.`,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#a51d3d'
                });
            } catch (error) {
                console.error('Error al aplicar tema:', error);
                Swal.fire({
                    title: 'Error al aplicar tema',
                    text: 'Hubo un problema al cambiar el tema. Por favor, intenta nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#a51d3d'
                });
            }
        }
    };

    // Detectar tema grises
    const isGrises = typeof document !== 'undefined' && document.body.classList.contains('theme-grises');
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50 }}>
            <nav style={{ background: isGrises ? 'var(--gris-btn-secundario)' : '#4B0C25', color: isGrises ? 'var(--gris-btn-texto-invertido)' : '#fff', padding: '0.7rem 2rem', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <img
                            src={logoSitmah}
                            alt="Logo Sitmah"
                            style={{ height: '40px', cursor: 'pointer' }}
                            onClick={() => navigateWithTransition('/administrador')}
                        />
                        <button
                            className="hamburger-menu"
                            onClick={toggleMenu}
                            style={{
                                display: 'none',
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                marginLeft: '1rem'
                            }}
                            data-theme-grises-style
                        >
                            ☰
                        </button>
                        {/* Menú de navegación desktop */}
                        <div className="navbar-menu-desktop" style={{ display: 'flex', gap: '0.7rem', marginLeft: '1rem', flexWrap: 'wrap', alignItems: 'center', maxWidth: '100vw' }}>
                            {menuOptions.map((menu, idx) => (
                                <div key={menu.label} style={{ position: 'relative', marginBottom: '0.2rem' }}>
                                    <button
                                        onClick={() => handleMenuClick(idx)}
                                        style={{
                                            background: isGrises ? 'var(--gris-btn-secundario)' : 'none',
                                            border: isGrises ? '1px solid var(--gris-btn-borde)' : 'none',
                                            color: isGrises ? 'var(--gris-btn-texto-invertido)' : '#fff',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            padding: '0.35rem 0.7rem',
                                            borderRadius: '5px',
                                            transition: 'background 0.2s',
                                            outline: 'none',
                                            whiteSpace: 'nowrap',
                                            minWidth: 80,
                                            maxWidth: 120,
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        }}
                                        onBlur={() => setTimeout(() => setOpenMenu(null), 200)}
                                    >
                                        {menu.label}
                                    </button>
                                    {openMenu === idx && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '2.2rem',
                                            left: 0,
                                            background: isGrises ? 'var(--gris-btn-principal)' : '#fff',
                                            color: isGrises ? 'var(--gris-btn-texto)' : '#4B0C25',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                            minWidth: '120px',
                                            zIndex: 100,
                                            maxHeight: '50vh',
                                            overflowY: 'auto',
                                        }}>
                                            {menu.subRoutes.map(sub => (
                                                <div
                                                    key={sub.path}
                                                    onClick={() => {
                                                        navigateWithTransition(sub.path);
                                                        setOpenMenu(null);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        borderBottom: isGrises ? '1px solid var(--gris-btn-borde)' : '1px solid #eee',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.93rem',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                    }}
                                                    onMouseDown={e => e.preventDefault()}
                                                >
                                                    {sub.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Menú móvil y tablet vertical mejorado */}
                        <div className={`navbar-menu-mobile ${isMenuOpen ? 'open' : ''}`} style={{ marginLeft: '2rem', maxHeight: '70vh', overflowY: 'auto', width: '90vw', background: isGrises ? 'var(--gris-btn-principal)' : '#fff', color: isGrises ? 'var(--gris-btn-texto)' : '#4B0C25', position: 'absolute', top: '60px', left: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.10)', zIndex: 200, padding: '1rem', display: isMenuOpen ? 'block' : 'none' }}>
                            {menuOptions.map((menu) => (
                                <div key={menu.label} style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{menu.label}</div>
                                    {menu.subRoutes.map(sub => (
                                        <button
                                            key={sub.path}
                                            onClick={() => {
                                                navigateWithTransition(sub.path);
                                                setIsMenuOpen(false);
                                            }}
                                            className="navbar-link"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.5rem 1rem',
                                                background: isGrises ? 'var(--gris-btn-secundario)' : 'none',
                                                border: isGrises ? '1px solid var(--gris-btn-borde)' : 'none',
                                                color: isGrises ? 'var(--gris-btn-texto-invertido)' : '#4B0C25',
                                                fontSize: '1rem',
                                                borderRadius: '6px',
                                                marginBottom: '0.2rem',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {sub.label}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={handleCambiarTema}
                            style={{
                                background: document.body.classList.contains('theme-grises') ? 'var(--gris-btn-secundario)' : '#a51d3d',
                                color: document.body.classList.contains('theme-grises') ? 'var(--gris-btn-texto-invertido)' : '#fff',
                                border: document.body.classList.contains('theme-grises') ? '1px solid var(--gris-btn-borde)' : 'none',
                                borderRadius: '6px',
                                padding: '0.45rem 1.1rem',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                cursor: 'pointer',
                                minWidth: 100,
                                whiteSpace: 'nowrap',
                                alignSelf: 'center',
                            }}
                        >
                            🎨 Tema
                        </button>
                        <button
                            onClick={handleLogout}
                            className="logout-button"
                            style={{
                                background: document.body.classList.contains('theme-grises') ? 'var(--gris-btn-secundario)' : '#CBB26A',
                                color: document.body.classList.contains('theme-grises') ? 'var(--gris-btn-texto-invertido)' : '#4B0C25',
                                border: document.body.classList.contains('theme-grises') ? '1px solid var(--gris-btn-borde)' : 'none',
                                borderRadius: '6px',
                                padding: '0.45rem 1.1rem',
                                fontWeight: 'bold',
                                fontSize: '0.98rem',
                                marginLeft: 0,
                                marginRight: 0,
                                marginTop: 0,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                cursor: 'pointer',
                                minWidth: 120,
                                maxWidth: 180,
                                whiteSpace: 'nowrap',
                                alignSelf: 'center',
                            }}
                        >
                            Finalizar sesión
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default NavbarAdministrador;