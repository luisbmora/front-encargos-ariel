// src/presentation/components/LoginForm.tsx
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Avatar,
  Link,
  Container,
  CircularProgress,
  Alert 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import theme from '../../theme/theme';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../app/AuthContext';
import { useState } from 'react';
import { loginAPI } from '../../api/authApi';

type FormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    
    try {
      const { usuario, token } = await loginAPI(data.email, data.password);
      login(usuario, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        {/* Icono */}
        <Avatar sx={{ 
          m: 1, 
          bgcolor: theme.palette.primary.main,
          width: 56, 
          height: 56 
        }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>

        {/* Título */}
        <Typography 
          component="h1" 
          variant="h5"
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 1
          }}
        >
          Encargos Ariel
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>Sistema de Gestión de Pedidos</Typography>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Campo Email */}
        <TextField
          fullWidth
          label="Correo electrónico"
          margin="normal"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email', { 
            required: 'El correo es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo electrónico no válido'
            }
          })}
        />

        {/* Campo Contraseña */}
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          margin="normal"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', { 
            required: 'La contraseña es requerida',
            minLength: {
              value: 6,
              message: 'Mínimo 6 caracteres'
            }
          })}
        />

        {/* Botón Login */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            bgcolor: theme.palette.primary.main,
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'INICIAR SESIÓN'
          )}
        </Button>

        {/* Enlace olvidé contraseña */}
        <Link 
          href="#"
          variant="body2"
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>
    </Container>
  );
};

export default LoginForm;