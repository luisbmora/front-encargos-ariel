// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // verde fuerte
    },
    secondary: {
      main: '#81c784', // verde claro
    },
    background: {
      default: '#f9fbe7', // fondo claro
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
