import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from './TransitionContext';
import logoSitmah from '../assets/logo-sitmah.png';
import '../Apertura.css';
import Swal from 'sweetalert2';

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

function NavbarVerificador() {
  const { navigateWithTransition } = useTransition();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = (path) => {
    navigateWithTransition(path);
    setIsMenuOpen(false);
  };

  return (
    <nav
      style={{
        background: '#6F2234',
        color: '#fff',
        padding: isMobile ? '0.5rem 0.3rem 0 0.3rem' : '0.5rem 0.5rem 0 0.5rem',
        width: '100%',
        boxShadow: 'none',
        borderBottom: 'none',
        marginBottom: 0,
        minHeight: isMobile ? 56 : 64,
      }}
    >
      <div
        className="navbar-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1400,
          margin: '0 auto',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.5rem' : 0,
          padding: isMobile ? '0.3rem 0.2rem' : '0.75rem 2rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="navbar-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '1.2rem' : '2rem',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <img
            src={logoSitmah}
            alt="Logo Sitmah"
            style={{ height: isMobile ? '32px' : '40px', cursor: 'pointer' }}
            onClick={() => navigateWithTransition('/verificador')}
          />
          <button
            className="hamburger-menu"
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              cursor: 'pointer',
              padding: isMobile ? '0.3rem' : '0.5rem',
              marginLeft: '1rem',
              display: isMobile ? 'block' : 'none',
            }}
          >
            ☰
          </button>
          {/* Menú móvil: visible solo en móvil/tablet */}
          {isMobile && isMenuOpen && (
            <div className={`navbar-menu-mobile open`} style={{ width: '100%', marginTop: 8 }}>
              <button onClick={() => handleNavClick('/verificador')} className={isActive('/verificador') + ' navbar-link'} style={{ width: '100%', marginBottom: 8 }}>Verificador</button>
              <button onClick={() => handleNavClick('/pendientes')} className={isActive('/pendientes') + ' navbar-link'} style={{ width: '100%', marginBottom: 8 }}>Pendientes</button>
              <button onClick={() => handleNavClick('/verificador/historial-verificador')} className={isActive('/verificador/historial-verificador') + ' navbar-link'} style={{ width: '100%', marginBottom: 8 }}>Historial Verificador</button>
              <button onClick={() => handleNavClick('/verificador/resumen-verificador')} className={isActive('/verificador/resumen-verificador') + ' navbar-link'} style={{ width: '100%', marginBottom: 8 }}>Resumen</button>
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
                  fontSize: isMobile ? '0.95rem' : '0.98rem',
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: '0.5rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                  minWidth: 120,
                  maxWidth: 180,
                  whiteSpace: 'nowrap',
                  alignSelf: 'center',
                  width: '100%',
                }}
              >
                Finalizar sesión
              </button>
            </div>
          )}
          <div className="navbar-menu-desktop" style={{ display: isMobile ? 'none' : 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button onClick={() => handleNavClick('/verificador')} className={isActive('/verificador') + ' navbar-link'}>Verificador</button>
            <button onClick={() => handleNavClick('/pendientes')} className={isActive('/pendientes') + ' navbar-link'}>Pendientes</button>
            <button onClick={() => handleNavClick('/verificador/historial-verificador')} className={isActive('/verificador/historial-verificador') + ' navbar-link'}>Historial Verificador</button>
            <button onClick={() => handleNavClick('/verificador/resumen-verificador')} className={isActive('/verificador/resumen-verificador') + ' navbar-link'}>Resumen</button>
          </div>
        </div>
        <div style={{ flex: 1 }} />
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
            fontSize: isMobile ? '0.95rem' : '0.98rem',
            marginLeft: isMobile ? 0 : '1.5rem',
            marginRight: 0,
            marginTop: isMobile ? 8 : 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            cursor: 'pointer',
            minWidth: 120,
            maxWidth: 180,
            whiteSpace: 'nowrap',
            alignSelf: 'center',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          Finalizar sesión
        </button>
      </div>
    </nav>
  );
}

export default NavbarVerificador;