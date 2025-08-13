// src/presentation/pages/LoginPage.tsx
import { Box } from '@mui/material';
import LoginForm from '../components/LoginForm';
import theme from '../../theme/theme';

const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <LoginForm />
    </Box>
  );
};

export default LoginPage;
