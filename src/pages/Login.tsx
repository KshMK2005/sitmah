import React, { useState, useEffect } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// import ojoImg from '../assets/ojo.png';
import { usuarioService } from '../services/api';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    // Cargar el plugin de Facebook para el feed
    useEffect(() => {
        if (!(window as any).FB) {
            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.crossOrigin = "anonymous";
            script.src = "https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v19.0";
            document.body.appendChild(script);
        } else {
            (window as any).FB.XFBML.parse();
        }
    }, []);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Limpiar el localStorage al montar el componente
    useEffect(() => {
        localStorage.removeItem('userRole');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId || !password) {
            Swal.fire({
                title: "Error",
                text: "Por favor, complete todos los campos",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        try {
            console.log('Intentando login con usuario:', userId);
            console.log('URL de API:', window.location.hostname);
            
            const user = await usuarioService.getByUsuario(userId);
            console.log('Respuesta de la API:', user);
            
            if (!user) {
                Swal.fire('Error', 'Usuario no encontrado', 'error');
                return;
            }
            if (user.password !== password) {
                Swal.fire('Error', 'Contraseña incorrecta', 'error');
                return;
            }
            // Guardar el rol y usuario en localStorage para mantener la sesión
            localStorage.setItem('userRole', user.rol);
            localStorage.setItem('userName', user.usuario);
            // Redirigir según el rol
            switch (user.rol) {
                case 'apertura':
                    navigate('/horarios');
                    break;
                case 'programador':
                    navigate('/programador');
                    break;
                case 'dashboard':
                    navigate('/dashboard');
                    break;
                case 'verificador':
                    navigate('/verificador');
                    break;
                case 'administrador':
                    navigate('/admin');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            console.error('Error en login:', err);
            Swal.fire('Error', 'Error al iniciar sesión', 'error');
        }
    };

    return (
        <div className="login-body">
            <header className="sitmah-header">
                <h1>Sistema de Despacho de Tuzobuses</h1>
                <p>Iniciar sesión – Acceso restringido</p>
            </header>

            <main className="login-container" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'stretch',
                gap: 0,
                minHeight: 600,
                width: '100%',
                maxWidth: 1100,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 24px #0002',
                overflow: 'hidden',
            }}>
                <div className="login-card" style={{
                    flex: 1,
                    minWidth: 340,
                    maxWidth: 480,
                    height: '100%',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'stretch',
                    alignItems: 'stretch',
                    background: 'white',
                    borderRight: '1px solid #eee',
                    boxSizing: 'border-box',
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2.5rem 2.5rem 2rem 2.5rem' }}>
                        <div className="login-logo-wrapper">
                            <img src="/logobola.png" alt="Logo TUZ" className="login-logo-img" />
                            <div className="login-logo-border"></div>
                        </div>
                        <h2 style={{ margin: '1.5rem 0 1rem 0', fontWeight: 700, color: '#6F2234' }}>Ingreso al sistema</h2>
                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            <label htmlFor="userId">ID de usuario:</label>
                            <input className='login-idusuario'
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Ej. TUZO001"
                                style={{ width: '100%', marginBottom: 16 }}
                            />
                            <label htmlFor="password">Contraseña:</label>
                            <div style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    style={{ width: '100%', paddingRight: 40, boxSizing: 'border-box' }}
                                />
                                <img
                                    src="/src/assets/ojo.png"
                                    alt="Mostrar contraseña"
                                    onClick={() => setShowPassword((v) => !v)}
                                    style={{ position: 'absolute', right: 12, top: '37%', transform: 'translateY(-50%)', width: 22, height: 22, cursor: 'pointer', opacity: showPassword ? 1 : 0.7, zIndex: 2, background: '#fff' }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label="Mostrar/ocultar contraseña"
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.7rem', fontSize: '1.1rem', fontWeight: 600, background: '#6F2234', color: '#fff', border: 'none', borderRadius: 8 }}>Ingresar</button>
                        </form>
                    </div>
                </div>

                {/* Facebook Feed */}
                <div className="landing-feed" style={{
                    flex: 1.2,
                    minWidth: 420,
                    maxWidth: 600,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#f7f7fa',
                    padding: 0,
                    boxSizing: 'border-box',
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2.5rem 1.5rem' }}>
                        <div id="fb-root"></div>
                        <div
                            className="fb-page"
                            data-href="https://www.facebook.com/TuzobusOficial"
                            data-tabs="timeline"
                            data-width="820"
                            data-height="940"
                            data-small-header="false"
                            data-adapt-container-width="true"
                            data-hide-cover="false"
                            data-show-facepile="true"
                            style={{ width: 420, minHeight: 540 }}
                        >
                            <blockquote cite="https://www.facebook.com/TuzobusOficial" className="fb-xfbml-parse-ignore">
                                <a href="https://www.facebook.com/TuzobusOficial">Ver publicaciones en Facebook</a>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="sitmah-footer">
                &copy; {new Date().getFullYear()} SITMAH Hidalgo – Sistema interno de control
            </footer>
        </div>
    );
}
