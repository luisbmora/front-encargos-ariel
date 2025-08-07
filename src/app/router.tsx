import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../presentation/pages/LoginPage';
import HomePage from '../presentation/pages/HomePage';
import PrivateRoute from './PrivateRouters';
import { AuthProvider } from './AuthContext';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;