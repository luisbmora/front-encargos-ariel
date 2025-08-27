import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../presentation/pages/LoginPage';
import MainApp from '../presentation/pages/MainApp';
import PrivateRoute from './PrivateRouters';
import { AuthProvider } from './AuthContext';
import { NavigationProvider } from './NavigationContext';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <MainApp />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainApp />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;