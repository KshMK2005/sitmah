import React, { useState } from 'react';
import { useTransition } from './TransitionContext';
import { useLocation } from 'react-router-dom';
import logoSitmah from '../assets/logo-sitmah.png';
import '../Apertura.css';
import Swal from 'sweetalert2';

function DashboardNavbar({ tab, setTab }) {
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
  };

  const isActive = (value) => {
    return `navbar-link ${tab === value ? 'active' : ''}`;
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNavClick = (value) => {
    setTab(value);
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
            onClick={() => setTab('programador')}
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
            <button className={isActive('programador')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setTab('programador')}>
              Programaciones
            </button>
            <button className={isActive('verificados')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setTab('verificados')}>
              Verificaciones
            </button>
            <button className={isActive('apertura')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setTab('apertura')}>
              Aperturas
            </button>
          </div>
        </div>
        <div className={`navbar-menu-mobile ${isMenuOpen ? 'open' : ''}`}>
          <button className={isActive('programador')} onClick={() => handleNavClick('programador')}>
            Programaciones
          </button>
          <button className={isActive('verificados')} onClick={() => handleNavClick('verificados')}>
            Verificaciones
          </button>
          <button className={isActive('apertura')} onClick={() => handleNavClick('apertura')}>
            Aperturas
          </button>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Finalizar sesión
        </button>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
