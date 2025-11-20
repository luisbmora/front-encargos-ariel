// src/app/AuthContext.tsx (actualización opcional)
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenUtils } from '../utils/tokenUtils';

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  permisos: string[];
}

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('usuario');
      
      if (token && storedUser) {
        if (!TokenUtils.isTokenExpired(token)) {
          // Token válido
          setUsuario(JSON.parse(storedUser));
          console.log('✅ Sesión restaurada correctamente');
          
          // Mostrar información del token en desarrollo
          const tokenInfo = TokenUtils.getTokenInfo(token);
          if (tokenInfo) {
            console.log(`⏰ Token expira en: ${TokenUtils.formatTimeUntilExpiry(token)}`);
          }
        } else {
          // Token expirado
          console.log('❌ Token expirado, limpiando sesión');
          TokenUtils.clearExpiredSession();
          setUsuario(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    // Verificar el token cada minuto
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && TokenUtils.isTokenExpired(token)) {
        console.log('❌ Token expirado durante la sesión');
        TokenUtils.clearExpiredSession();
        setUsuario(null);
        navigate('/login');
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [navigate]);

  const login = (user: Usuario, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(user));
    setUsuario(user);
    navigate('/home');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};