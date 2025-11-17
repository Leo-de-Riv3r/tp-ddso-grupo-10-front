import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  
  // Si 'user' es null (no autenticado) y 'null' ESTÁ en 'allowedRoles', PERMITIR.
  if (!user && allowedRoles.includes(null)) {
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.tipo)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;