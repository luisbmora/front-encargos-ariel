// src/utils/tokenUtils.ts
export const TokenUtils = {
  // Verificar si el token está expirado
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp ? payload.exp < currentTime : true;
    } catch (error) {
      return true; // Si no se puede decodificar, considerarlo expirado
    }
  },

  // Obtener información del token
  getTokenInfo: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId || payload.sub,
        exp: payload.exp,
        iat: payload.iat,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        timeUntilExpiry: payload.exp ? payload.exp - (Date.now() / 1000) : 0,
      };
    } catch (error) {
      return null;
    }
  },

  // Verificar si el token expira pronto (menos de 5 minutos)
  isTokenExpiringSoon: (token: string, minutesThreshold: number = 5): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const thresholdTime = minutesThreshold * 60; // convertir a segundos
      
      return payload.exp ? (payload.exp - currentTime) < thresholdTime : true;
    } catch (error) {
      return true;
    }
  },

  // Limpiar sesión si el token está expirado
  clearExpiredSession: (): boolean => {
    const token = localStorage.getItem('token');
    
    if (!token) return false;
    
    if (TokenUtils.isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      return true; // Token estaba expirado y se limpió
    }
    
    return false; // Token válido
  },

  // Formatear tiempo restante
  formatTimeUntilExpiry: (token: string): string => {
    const info = TokenUtils.getTokenInfo(token);
    
    if (!info || !info.timeUntilExpiry || info.timeUntilExpiry <= 0) {
      return 'Expirado';
    }
    
    const minutes = Math.floor(info.timeUntilExpiry / 60);
    const seconds = Math.floor(info.timeUntilExpiry % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },
};