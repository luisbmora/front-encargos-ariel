// src/app/PrivateRouters.tsx
import React from 'react'; // Añade esta importación
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => { // Cambia JSX.Element por React.ReactNode
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;