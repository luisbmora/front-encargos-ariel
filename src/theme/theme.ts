// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Verde principal
      dark: '#1B5E20', // Verde oscuro
      light: '#66BB6A', // Verde claro
    },
    secondary: {
      main: '#FF9800', // Naranja principal
      dark: '#F57C00', // Naranja oscuro
      light: '#FFB74D', // Naranja claro
    },
    background: {
      default: '#F4F9F4', // Fondo gris verdoso muy claro
      paper: '#FFFFFF',   // Fondo de tarjetas
    },
    text: {
      primary: '#1B1B1B', // Texto principal
      secondary: '#4E6E4E', // Texto secundario con tinte verde
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: { fontWeight: 'bold' },
    h5: { fontWeight: 'bold' },
    button: { fontWeight: 'bold', textTransform: 'none' },
  },
});

export default theme;
