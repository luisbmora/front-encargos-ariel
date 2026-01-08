import { Box, TextField, Button, Typography, Link, CircularProgress, Alert, IconButton, InputAdornment } from '@mui/material';
import theme from '../../theme/theme';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../app/AuthContext';
import { useState } from 'react';
import { loginAPI } from '../../api/authApi';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// IMPORTA TU IMAGEN AQUÍ (Asegúrate que el nombre y ruta sean correctos)
import logoImage from '../../assets/logo-delivery.svg'; 

type FormData = { email: string; password: string; };

const LoginForm = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* SECCIÓN LOGO E INTRODUCCIÓN */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Imagen del Logo */}
        <Box
          component="img"
          src={logoImage}
          alt="Logo Ncargos"
          sx={{
            width: 100,       // Ajusta este tamaño según tu logo
            height: 100,      // Mantener cuadrado o quitar height si es rectangular
            objectFit: 'contain',
            mb: 2,
            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' // Sombra sutil al logo
          }}
        />
        
        <Typography variant="h4" fontWeight="800" sx={{ color: theme.palette.primary.main, mb: 1 }}>
          Ncargos Ariel
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center">
         Sistema de Gestión de Pedidos
        </Typography>
      </Box>

      {/* ALERTAS DE ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* CAMPOS DE TEXTO */}
      <TextField
        fullWidth
        label="Correo electrónico"
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={{
            // Estilo para que el input combine con el efecto glass
            '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.5)', 
            }
        }}
        {...register('email', {
          required: 'El correo es requerido',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo electrónico no válido',
          },
        })}
      />

      <TextField
        fullWidth
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{
            '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.5)', 
            }
        }}
        {...register('password', {
          required: 'La contraseña es requerida',
          minLength: { value: 6, message: 'Mínimo 6 caracteres' },
        })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Link href="#" underline="hover" sx={{ fontSize: 14, fontWeight: 500, color: theme.palette.primary.main }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </Box> */}

      {/* BOTÓN DE LOGIN */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{
          mt: 4,
          mb: 2,
          py: 1.5,
          bgcolor: theme.palette.secondary.main,
          color: theme.palette.getContrastText(theme.palette.secondary.main), // Asegura que el texto se lea bien
          fontWeight: 'bold',
          borderRadius: 2,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Sombra para que destaque
          '&:hover': { 
            bgcolor: theme.palette.secondary.dark,
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
          transition: 'all 0.2s ease-in-out'
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
      </Button>
    </Box>
  );
};

export default LoginForm;