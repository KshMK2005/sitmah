import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import NavbarAdministrador from './Administrador';
import { useLocation } from 'react-router-dom';
import PageTransitionBar from './components/PageTransitionBar';
import { useTransition } from './components/TransitionContext';
import LluviaSanValentin from './components/LluviaSanValentin';
import LluviaNavidad from './components/LluviaNavidad';
import LluviaMuertos from './components/LluviaMuertos';
import { applySavedTheme, checkForThemeUpdates } from './utils/theme';

export default function Layout({ children }) {
  const role = localStorage.getItem('userRole');
  const location = useLocation();
  const [tema, setTema] = useState(localStorage.getItem('temaGlobal') || 'normal');

  useEffect(() => {
    // Aplicar tema desde la configuración global al cargar la aplicación
    applySavedTheme().then(() => {
      // Actualizar el estado local después de aplicar el tema
      setTema(localStorage.getItem('temaGlobal') || 'normal');
    }).catch(error => {
      console.error('Error al aplicar tema desde la configuración global:', error);
      // Si falla, usar localStorage
      setTema(localStorage.getItem('temaGlobal') || 'normal');
    });

    // Verificar actualizaciones de tema cada 5 segundos
    const intervalId = setInterval(async () => {
      const nuevoTema = await checkForThemeUpdates();
      if (nuevoTema) {
        setTema(nuevoTema);
      }
    }, 5000);

    const onStorage = () => setTema(localStorage.getItem('temaGlobal') || 'normal');
    window.addEventListener('storage', onStorage);
    const observer = new MutationObserver(() => setTema(localStorage.getItem('temaGlobal') || 'normal'));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <PageTransitionBar />
      {tema === 'sanvalentin' && <LluviaSanValentin />}
      {tema === 'navidad' && <LluviaNavidad />}
      {tema === 'muertos' && <LluviaMuertos />}
      {role === 'administrador' && <NavbarAdministrador />}
      <div
        key={location.pathname}
        className="page-fade"
        style={{ marginTop: role === 'administrador' ? '70px' : 0 }}
      >
        {children}
      </div>
    </>
  );
}
