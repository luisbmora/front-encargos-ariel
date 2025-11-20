// src/presentation/components/TokenStatus.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper,
  Button,
} from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const TokenStatus: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      
      if (storedToken) {
        try {
          // Decodificar el JWT para mostrar información
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setTokenInfo(payload);
        } catch (error) {
          console.error('Error decodificando token:', error);
          setTokenInfo(null);
        }
      }
    };

    checkToken();
    
    // Verificar cada 5 segundos
    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, []);

  const isTokenExpired = () => {
    if (!tokenInfo || !tokenInfo.exp) return true;
    return Date.now() >= tokenInfo.exp * 1000;
  };

  const formatExpiration = () => {
    if (!tokenInfo || !tokenInfo.exp) return 'No disponible';
    const expDate = new Date(tokenInfo.exp * 1000);
    return expDate.toLocaleString('es-ES');
  };

  const handleRefreshToken = () => {
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SecurityIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          Estado del Token de Autenticación
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <Chip
          icon={token ? <CheckIcon /> : <ErrorIcon />}
          label={token ? 'Token Presente' : 'Token No Encontrado'}
          color={token ? 'success' : 'error'}
          variant="outlined"
        />
        
        {token && (
          <Chip
            icon={isTokenExpired() ? <ErrorIcon /> : <CheckIcon />}
            label={isTokenExpired() ? 'Token Expirado' : 'Token Válido'}
            color={isTokenExpired() ? 'error' : 'success'}
            variant="outlined"
          />
        )}
      </Box>

      {tokenInfo && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Usuario:</strong> {tokenInfo.userId || 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Expira:</strong> {formatExpiration()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Emitido:</strong> {tokenInfo.iat ? new Date(tokenInfo.iat * 1000).toLocaleString('es-ES') : 'No disponible'}
          </Typography>
        </Box>
      )}

      {token && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace', 
            fontSize: '0.75rem',
            bgcolor: '#f5f5f5',
            p: 1,
            borderRadius: 1,
            wordBreak: 'break-all',
          }}>
            {token.substring(0, 50)}...
          </Typography>
        </Box>
      )}

      {(!token || isTokenExpired()) && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefreshToken}
            size="small"
          >
            Recargar Página
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default TokenStatus;