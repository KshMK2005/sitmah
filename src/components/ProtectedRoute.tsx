import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const userRole = localStorage.getItem('userRole');
    const location = useLocation();

    // Si estamos en la ruta /home, permitir el acceso sin userRole
    if (location.pathname === '/home') {
        return <>{children}</>;
    }

    // Para otras rutas, verificar el userRole
    if (!userRole) {
        // Si no hay rol guardado, redirigir al login
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}; 