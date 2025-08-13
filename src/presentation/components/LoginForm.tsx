// src/presentation/components/LoginForm.tsx
import { Box, TextField, Button, Typography, Avatar, Link, CircularProgress, Alert } from '@mui/material';
import theme from '../../theme/theme';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../app/AuthContext';
import { useState } from 'react';
import { loginAPI } from '../../api/authApi';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

type FormData = { email: string; password: string; };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 380,
        bgcolor: 'white',
        borderRadius: 3,
        p: 4,
        boxShadow: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <Avatar
        sx={{
          bgcolor: 'transparent',
          width: 80,
          height: 80,
          mb: 2,
        }}
        variant="square"
      >
        <LocalShippingIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />
      </Avatar>

      {/* Título */}
      <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
        Ncargos Ariel
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sistema de Gestión de Pedidos
      </Typography>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Email */}
      <TextField
        fullWidth
        label="Correo electrónico"
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: 'El correo es requerido',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo electrónico no válido',
          },
        })}
      />

      {/* Contraseña */}
      <TextField
        fullWidth
        label="Contraseña"
        type="password"
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password', {
          required: 'La contraseña es requerida',
          minLength: { value: 6, message: 'Mínimo 6 caracteres' },
        })}
      />

      {/* Botón */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          bgcolor: theme.palette.secondary.main,
          color: 'black',
          fontWeight: 'bold',
          '&:hover': { bgcolor: theme.palette.secondary.dark },
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>

      {/* Enlace */}
      <Link href="#" underline="hover" sx={{ mt: 1, fontSize: 14 }}>
        ¿Olvidaste tu contraseña?
      </Link>
    </Box>
  );
};

export default LoginForm;
