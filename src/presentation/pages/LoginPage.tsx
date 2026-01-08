import { Box, Paper, useMediaQuery } from '@mui/material';
import LoginForm from '../components/LoginForm';
import theme from '../../theme/theme';
import Lottie from 'lottie-react';
// Asegúrate de que esta ruta sea correcta
import deliveryAnimation from '../../assets/animations/delivery-animation.json'; 

const LoginPage = () => {
  // Detectar si es pantalla pequeña (móvil) para cambiar el diseño
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        // OPCIÓN 3: Fondo Spotlight (Luz en el centro, oscuro en los bordes)
        // Esto hace que el formulario resalte mucho más
        background: `radial-gradient(circle at center, ${theme.palette.primary.light} 10%, ${theme.palette.primary.dark} 90%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Contenedor tipo Tarjeta Flotante */}
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          width: '100%',
          maxWidth: 950,
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: 'transparent', // Lo hacemos transparente para controlar el color en las cajas internas
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // Sombra profunda
        }}
      >
        
        {/* LADO IZQUIERDO: Formulario con efecto "Glass" */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            // Efecto Cristal / Glassmorphism
            bgcolor: 'rgba(255, 255, 255, 0.92)', // Blanco con un poco de transparencia
            backdropFilter: 'blur(10px)',         // Difumina lo que haya detrás (si hubiera elementos)
            p: isMobile ? 3 : 6,
          }}
        >
          <LoginForm />
        </Box>

        {/* LADO DERECHO: Animación */}
        <Box
          sx={{
            flex: 1.2,
            // Un fondo claro pero diferente al del form para separar visualmente
            bgcolor: 'rgba(255, 255, 255, 0.96)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative',
          }}
        >
          {/* Elemento decorativo de fondo (Círculo sutil detrás del camión) */}
          <Box 
            sx={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.main}20 100%)`,
              zIndex: 0,
              filter: 'blur(40px)', // Círculo difuminado
            }} 
          />
          
          <Box sx={{ zIndex: 1, width: '100%', maxWidth: 450 }}>
             <Lottie animationData={deliveryAnimation} loop={true} />
          </Box>
        </Box>

      </Paper>
    </Box>
  );
};

export default LoginPage;