// src/app/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  permisos: string[];
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');
    if (token && storedUser) {
      setUsuario(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, []);

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
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};
