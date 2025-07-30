import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import NavbarAdministrador from './Administrador';
import { useLocation } from 'react-router-dom';
import PageTransitionBar from './components/PageTransitionBar';
import { useTransition } from './components/TransitionContext';
import LluviaSanValentin from './components/LluviaSanValentin';
import LluviaNavidad from './components/LluviaNavidad';
import LluviaMuertos from './components/LluviaMuertos';

export default function Layout({ children }) {
  const role = localStorage.getItem('userRole');
  const location = useLocation();
  const [tema, setTema] = useState(localStorage.getItem('temaGlobal') || 'normal');

  useEffect(() => {
    const onStorage = () => setTema(localStorage.getItem('temaGlobal') || 'normal');
    window.addEventListener('storage', onStorage);
    const observer = new MutationObserver(() => setTema(localStorage.getItem('temaGlobal') || 'normal'));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
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
