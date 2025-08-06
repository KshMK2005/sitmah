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
    const initializeTheme = async () => {
      try {
        await applySavedTheme();
        // Actualizar el estado local después de aplicar el tema
        const currentTheme = localStorage.getItem('temaGlobal') || 'normal';
        setTema(currentTheme);
        console.log(`🎨 Tema inicial aplicado: ${currentTheme}`);
      } catch (error) {
        console.error('Error al aplicar tema inicial:', error);
        // Si falla, usar localStorage
        const fallbackTheme = localStorage.getItem('temaGlobal') || 'normal';
        setTema(fallbackTheme);
      }
    };

    initializeTheme();

    // Verificar actualizaciones de tema cada 3 segundos (más frecuente)
    const intervalId = setInterval(async () => {
      try {
        const nuevoTema = await checkForThemeUpdates();
        if (nuevoTema) {
          console.log(`🔄 Tema actualizado automáticamente: ${nuevoTema}`);
          setTema(nuevoTema);
        }
      } catch (error) {
        console.error('Error al verificar actualizaciones de tema:', error);
      }
    }, 3000); // Verificar cada 3 segundos

    // Escuchar cambios en localStorage (para desarrollo)
    const onStorage = () => {
      const newTheme = localStorage.getItem('temaGlobal') || 'normal';
      if (newTheme !== tema) {
        console.log(`🔄 Tema cambiado desde localStorage: ${newTheme}`);
        setTema(newTheme);
      }
    };
    window.addEventListener('storage', onStorage);

    // Observer para cambios en el DOM (como respaldo)
    const observer = new MutationObserver(() => {
      const currentTheme = localStorage.getItem('temaGlobal') || 'normal';
      if (currentTheme !== tema) {
        console.log(`🔄 Tema detectado en DOM: ${currentTheme}`);
        setTema(currentTheme);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, [tema]);

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
