// src/presentation/pages/LoginPage.tsx
import { Container, CssBaseline, Box, Avatar, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginForm from '../components/LoginForm';
import theme from '../../theme/theme';

const LoginPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" color={theme.palette.primary.main}>
          Encargos Ariel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sistema de gestión de pedidos
        </Typography>
        <Box sx={{ mt: 3, width: '100%' }}>
          <LoginForm />
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;