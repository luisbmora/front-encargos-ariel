// src/presentation/components/TokenExpiryWarning.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { TokenUtils } from '../../utils/tokenUtils';
import { useAuth } from '../../app/AuthContext';

const TokenExpiryWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      // Mostrar advertencia si quedan menos de 5 minutos
      if (TokenUtils.isTokenExpiringSoon(token, 5)) {
        setShowWarning(true);
        setTimeLeft(TokenUtils.formatTimeUntilExpiry(token));
      } else {
        setShowWarning(false);
      }

      // Si el token ya expiró, cerrar sesión
      if (TokenUtils.isTokenExpired(token)) {
        logout();
      }
    };

    // Verificar inmediatamente
    checkTokenExpiry();

    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenExpiry, 30000);

    return () => clearInterval(interval);
  }, [logout]);

  const handleExtendSession = () => {
    // Aquí podrías implementar la renovación del token
    // Por ahora, solo cerramos la advertencia
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Snackbar
      open={showWarning}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }} // Para que no se superponga con el AppBar
    >
      <Alert
        severity="warning"
        sx={{ width: '100%' }}
        action={
          <div>
            <Button color="inherit" size="small" onClick={handleExtendSession}>
              Continuar
            </Button>
            <Button color="inherit" size="small" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        }
      >
        Tu sesión expirará en {timeLeft}. ¿Deseas continuar?
      </Alert>
    </Snackbar>
  );
};

export default TokenExpiryWarning;