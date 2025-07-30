import React, { useEffect } from 'react';
import './style.css';
import { Link } from 'react-router-dom';

export default function Home() {
  // Limpiar el userRole cuando se monta el componente
  useEffect(() => {
    localStorage.removeItem('userRole');
  }, []);

  return (

    <div className="container_home">
      <header className="sitmah-header">
        <h1>Sistema de Despacho de Tuzobuses</h1>
      </header>
      {/* Sin Navbar, igual que Login */}
      <main className="main-content" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#6F2234', fontSize: '1.8rem', marginBottom: '1rem' }}>Bienvenido al sistema</h2>
        <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
          Este sistema permite registrar, verificar y enviar información de despacho en tiempo real,
          digitalizando procesos y manteniendo la comunicación con el centro de control SITMAH.
        </p>
        <br />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="button" style={{ background: '#6F2234', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            Ingresar al sistema
          </Link>
        </div>
      </main>
      <footer className="sitmah-footer">
        &copy; {new Date().getFullYear()} SITMAH Hidalgo – Sistema interno de control
      </footer>
    </div>
  );
}