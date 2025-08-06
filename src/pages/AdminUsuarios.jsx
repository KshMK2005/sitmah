import React from 'react';
import Swal from 'sweetalert2';
import { usuarioService } from '../services/api';
import '../themes.css';
import { setGlobalTheme } from '../utils/theme';
import { configuracionService } from '../services/api';

export default function AdminUsuarios() {
    // SweetAlert para editar datos de usuario
    const handleEditarUsuario = async () => {
        const { value: nombre } = await Swal.fire({
            title: 'Buscar usuario',
            input: 'text',
            inputLabel: 'Nombre de usuario',
            inputPlaceholder: 'Escribe el nombre de usuario',
            showCancelButton: true,
            confirmButtonText: 'Buscar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) return 'Debes ingresar un nombre de usuario';
            }
        });
        if (!nombre) return;
        const user = await usuarioService.getByUsuario(nombre);
        if (!user) {
            Swal.fire('No encontrado', 'Usuario no encontrado', 'error');
            return;
        }
        const { value: formValues } = await Swal.fire({
            title: 'Editar usuario',
            html:
                `<div style="display:flex;flex-direction:column;gap:0.7rem;align-items:stretch;max-width:350px;margin:0 auto;">
                    <label style='font-weight:600;'>Nombre de usuario <br />
                        <input id="swal-input1" class="swal2-input" placeholder="Usuario" value="${user.usuario}" style="margin-top:0.2rem;" />
                    </label>
                    <label style='font-weight:600;position:relative;display:block;'>Contraseña <br />
                        <input id="swal-input2" class="swal2-input" placeholder="Contraseña" type="password" value="${user.password}" style="margin-top:0.2rem;padding-right:2.5rem;width:calc(100% - 70px);box-sizing:border-box;display:inline-block;vertical-align:middle;" />
                        <img id="swal-eye2" src="/src/assets/ojo.png" alt="Mostrar contraseña" style="position:absolute;right:2.7rem;top:calc(50% + 0.7rem);transform:translateY(-50%);width:22px;height:22px;cursor:pointer;opacity:0.9;pointer-events:auto;z-index:2;" />
                    </label>
                    <label style='font-weight:600;'>Tarjetón <br />
                        <input id="swal-input4" class="swal2-input" placeholder="Tarjetón" value="${user.tarjeton || ''}" style="margin-top:0.2rem;" />
                    </label>
                    <label style='font-weight:600;'>Correo electrónico <br />
                        <input id="swal-input5" class="swal2-input" placeholder="Correo electrónico" type="email" value="${user.correo || ''}" style="margin-top:0.2rem;" />
                    </label>
                    <label style='text-align:left;font-weight:600;'>Rol<br />
                        <select id="swal-input3" class="swal2-input" style="margin-top:0.2rem;">
                            <option value="programador" ${user.rol === 'programador' ? 'selected' : ''}>Programador</option>
                            <option value="apertura" ${user.rol === 'apertura' ? 'selected' : ''}>Apertura</option>
                            <option value="verificador" ${user.rol === 'verificador' ? 'selected' : ''}>Verificador</option>
                            <option value="dashboard" ${user.rol === 'dashboard' ? 'selected' : ''}>Dashboard</option>
                            <option value="administrador" ${user.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </label>
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            didOpen: () => {
                const input = document.getElementById('swal-input2');
                const eye = document.getElementById('swal-eye2');
                if (input && eye) {
                    let visible = false;
                    eye.addEventListener('click', () => {
                        visible = !visible;
                        input.type = visible ? 'text' : 'password';
                        eye.style.opacity = visible ? '1' : '0.7';
                    });
                }
            },
            preConfirm: () => {
                const usuario = document.getElementById('swal-input1').value;
                const password = document.getElementById('swal-input2').value;
                const rol = document.getElementById('swal-input3').value; 
                const tarjeton = document.getElementById('swal-input4').value;
                const correo = document.getElementById('swal-input5').value;
                // Validaciones
                if (!usuario || !password || !rol || !tarjeton || !correo) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }
                if (usuario.length < 3) {
                    Swal.showValidationMessage('El usuario debe tener al menos 3 caracteres');
                    return false;
                }
                if (password.length < 5) {
                    Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
                    return false;
                }
                if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(correo)) {
                    Swal.showValidationMessage('Correo electrónico no válido');
                    return false;
                }
                return { usuario, password, rol, tarjeton, correo };
            }
        });
        if (formValues) {
            try {
                await usuarioService.update(user.usuario, formValues);
                Swal.fire('Actualizado', 'Datos actualizados correctamente', 'success');
            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    // SweetAlert para registrar usuario
    const handleRegistrarUsuario = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Registrar usuario',
            html:
                `<div style="display:flex;flex-direction:column;gap:0.7rem;align-items:stretch;max-width:350px;margin:0 auto;">
                    <label style='font-weight:400;'>Nombre de usuario <br />
                        <input id="swal-input1" class="swal2-input" placeholder="Usuario" style="margin-top:0.2rem;" />
                    </label>
                    <label style='font-weight:600;position:relative;display:block;'>Contraseña<br />
                        <input id="swal-input2" class="swal2-input" placeholder="Contraseña" type="password" style="margin-top:0.2rem;padding-right:2.5rem;width:calc(100% - 70px);box-sizing:border-box;display:inline-block;vertical-align:middle;" />
                        <img id="swal-eye2" src="/src/assets/ojo.png" alt="Mostrar contraseña" style="position:absolute;right:2.7rem;top:calc(50% + 0.7rem);transform:translateY(-50%);width:22px;height:22px;cursor:pointer;opacity:0.9;pointer-events:auto;z-index:2;" />
                    </label>
                    <label style='font-weight:600;'>Tarjetón<br />
                        <input id="swal-input4" class="swal2-input" placeholder="Tarjetón" style="margin-top:0.2rem;" />
                    </label>
                    <label style='font-weight:600;'>Correo electrónico<br />
                        <input id="swal-input5" class="swal2-input" placeholder="Correo electrónico" type="email" style="margin-top:0.2rem;" />
                    </label>
                    <label style='text-align:left;font-weight:600;'>Rol<br />
                        <select id="swal-input3" class="swal2-input" style="margin-top:0.2rem;">
                            <option value="programador">Programador</option>
                            <option value="apertura">Apertura</option>
                            <option value="verificador">Verificador</option>
                            <option value="dashboard">Dashboard</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </label>
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            didOpen: () => {
                const input = document.getElementById('swal-input2');
                const eye = document.getElementById('swal-eye2');
                if (input && eye) {
                    let visible = false;
                    eye.addEventListener('click', () => {
                        visible = !visible;
                        input.type = visible ? 'text' : 'password';
                        eye.style.opacity = visible ? '1' : '0.7';
                    });
                }
            },
            preConfirm: () => {
                const usuario = document.getElementById('swal-input1').value;
                const password = document.getElementById('swal-input2').value;
                const rol = document.getElementById('swal-input3').value;
                const tarjeton = document.getElementById('swal-input4').value;
                const correo = document.getElementById('swal-input5').value;
                // Validaciones
                if (!usuario || !password || !rol || !tarjeton || !correo) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }
                if (usuario.length < 3) {
                    Swal.showValidationMessage('El usuario debe tener al menos 3 caracteres');
                    return false;
                }
                if (password.length < 5) {
                    Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
                    return false;
                }
                if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(correo)) {
                    Swal.showValidationMessage('Correo electrónico no válido');
                    return false;
                }
                return { usuario, password, rol, tarjeton, correo };
            }
        });
        if (formValues) {
            try {
                await usuarioService.register(formValues);
                Swal.fire('Registrado', 'Usuario registrado correctamente', 'success');
            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    // Función para elegir tema con sincronización global
    const handleElegirTema = async () => {
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

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 24px #0002', padding: 40, minWidth: 320, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: 32 }}>Gestión de usuarios</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <button style={btnStyle} onClick={handleEditarUsuario}>Editar datos de usuario</button>
                    <button style={btnStyle} onClick={handleRegistrarUsuario}>Registrar usuario</button>
                    <button style={btnStyle} onClick={handleElegirTema}>Elegir tema</button>
                </div>
            </div>
        </div>
    );
}

const isGrisesTheme = () => typeof document !== 'undefined' && document.body.classList.contains('theme-grises');
const btnStyle = {
    background: isGrisesTheme() ? 'var(--gris-btn-principal)' : '#a51d3d',
    color: isGrisesTheme() ? 'var(--gris-btn-texto)' : '#fff',
    border: isGrisesTheme() ? '1px solid var(--gris-btn-borde)' : 'none',
    borderRadius: 8,
    padding: '0.9rem 1.2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 0,
    transition: 'background 0.2s, color 0.2s',
};