import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
// Importación global de SweetAlert2 para asegurar disponibilidad
import Swal from 'sweetalert2';
window.Swal = Swal;
import Home from './pages/Home';
import Login from './pages/Login';
import App from './App.jsx';
import Apertura from './Apertura.jsx';
import TablaCompleta from './components/TablaCompleta';
import TablasGuardadas from './components/TablasGuardadas';
import Programador from './Programador';
import { ProtectedRoute } from './components/ProtectedRoute';
import TablasProgramador from './components/TablasProgramador';
import Historial from './pages/Historial';
import ProgramacionesGuardadas from './components/ProgramacionesGuardadas';
import Verificador from './components/Verificador';
import Dashboard from './components/Dashboard';
import HistorialVerificador from './components/HistorialVerificador';
import Administrador from './Administrador.jsx';
import AdminUsuarios from './pages/AdminUsuarios';

import TransitionLayout from './components/TransitionLayout';
import Pendientes from './pages/Pendientes';

const router = createBrowserRouter([
  {
    element: <TransitionLayout><ProtectedRoute><Pendientes /></ProtectedRoute></TransitionLayout>,
    path: '/pendientes',
  },
  { path: '/', element: <Login /> },
  { path: '/home', element: <Home /> },
  { path: '/login', element: <Login /> },
  {
    element: <TransitionLayout><ProtectedRoute><App /></ProtectedRoute></TransitionLayout>,
    path: '/horarios',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Apertura /></ProtectedRoute></TransitionLayout>,
    path: '/apertura',
  },
  {
    element: <TransitionLayout><ProtectedRoute><TablaCompleta /></ProtectedRoute></TransitionLayout>,
    path: '/tabla-completa',
  },
  {
    element: <TransitionLayout><ProtectedRoute><TablasGuardadas /></ProtectedRoute></TransitionLayout>,
    path: '/tablas-guardadas',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Historial /></ProtectedRoute></TransitionLayout>,
    path: '/historial',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Programador /></ProtectedRoute></TransitionLayout>,
    path: '/programador',
  },
  {
    element: <TransitionLayout><ProtectedRoute><TablasProgramador /></ProtectedRoute></TransitionLayout>,
    path: '/programador/tablas',
  },
  {
    element: <TransitionLayout><ProtectedRoute><ProgramacionesGuardadas /></ProtectedRoute></TransitionLayout>,
    path: '/programador/guardadas',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Verificador /></ProtectedRoute></TransitionLayout>,
    path: '/verificador',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Dashboard /></ProtectedRoute></TransitionLayout>,
    path: '/dashboard',
  },
  {
    element: <TransitionLayout><ProtectedRoute><HistorialVerificador /></ProtectedRoute></TransitionLayout>,
    path: '/verificador/historial-verificador',
  },
  {
    element: <TransitionLayout><ProtectedRoute><Administrador /></ProtectedRoute></TransitionLayout>,
    path: '/admin',
  },
  {
    element: <TransitionLayout><ProtectedRoute><AdminUsuarios /></ProtectedRoute></TransitionLayout>,
    path: '/admin-usuarios',
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)