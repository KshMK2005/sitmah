import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSitmah from '../assets/logo-sitmah.png';
import '../Apertura.css';
import { useTransition } from './TransitionContext';
import Swal from 'sweetalert2';

function Navbar() {
  const { navigateWithTransition } = useTransition();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro que quieres salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      navigateWithTransition('/login');
    }
    // Si elige 'No', no hace nada y permanece en la página
  };

  const isActive = (path) => {
    return `navbar-link ${location.pathname === path ? 'active' : ''}`;
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = (path) => {
    navigateWithTransition(path);
    setIsMenuOpen(false);
  };

  return (
    <nav style={{ background: '#6F2234', color: '#fff', padding: '0.5rem 0.5rem', width: '100%', boxShadow: 'none', borderBottom: 'none' }}>
      <div className="navbar-content">
        <div className="navbar-left">
          <img
            src={logoSitmah}
            alt="Logo Sitmah"
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={() => navigateWithTransition('/horarios')}
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
          >
            ☰
          </button>
          <div className="navbar-menu-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button onClick={() => handleNavClick('/horarios')} className={isActive('/horarios')}>Horarios</button>
            <button onClick={() => handleNavClick('/tablas-guardadas')} className={isActive('/tablas-guardadas')}>Tablas Guardadas</button>
            <button onClick={() => handleNavClick('/historial')} className={isActive('/historial')}>Historial</button>
          </div>
        </div>
        <div className={`navbar-menu-mobile ${isMenuOpen ? 'open' : ''}`}>
          <button onClick={() => handleNavClick('/horarios')} className={isActive('/horarios')}>Horarios</button>
          <button onClick={() => handleNavClick('/tablas-guardadas')} className={isActive('/tablas-guardadas')}>Tablas Guardadas</button>
          <button onClick={() => handleNavClick('/historial')} className={isActive('/historial')}>Historial</button>
        </div>
        <button
          onClick={handleLogout}
          className="logout-button"
          style={{
            background: '#CBB26A',
            color: '#4B0C25',
            border: 'none',
            borderRadius: '6px',
            padding: '0.45rem 1.1rem',
            fontWeight: 'bold',
            fontSize: '0.98rem',
            marginLeft: '1.5rem',
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
    </nav>
  );
}

export default Navbar;