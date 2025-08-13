// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6A1B9A', // Morado principal
      dark: '#4A148C', // Morado oscuro
      light: '#9C4DCC',
    },
    secondary: {
      main: '#FFD600', // Amarillo principal
      dark: '#FFC400',
      light: '#FFECB3',
    },
    background: {
      default: '#F5F5F5', // Fondo gris claro
      paper: '#FFFFFF',   // Fondo de tarjetas
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
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
