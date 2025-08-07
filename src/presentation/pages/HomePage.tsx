import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Stack, 
  IconButton,
  Menu,
  MenuItem,
  Modal,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import theme from '../../theme/theme';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { useState } from 'react';
import { useAuth } from '../../app/AuthContext';

const HomePage = () => {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openRepartidores, setOpenRepartidores] = useState(false);
  const openMenu = Boolean(anchorEl);

  // Datos de ejemplo para repartidores
  const repartidores = [
    { nombre: 'Juan Pérez', estado: 'Activo', pedidos: 3 },
    { nombre: 'María García', estado: 'Activo', pedidos: 2 },
    { nombre: 'Carlos López', estado: 'En descanso', pedidos: 0 }
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleOpenRepartidores = () => {
    setOpenRepartidores(true);
    handleMenuClose();
  };

  const handleCloseRepartidores = () => {
    setOpenRepartidores(false);
  };

  return (
    <Container maxWidth="lg">
      {/* Menú de opciones */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleOpenRepartidores}>
            <PeopleIcon sx={{ mr: 1 }} />
            Ver Repartidores
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Cerrar Sesión
          </MenuItem>
        </Menu>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color={theme.palette.primary.main}>
          Panel de Control - Encargos Ariel
        </Typography>
        
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Pedidos Hoy</Typography>
            <Typography variant="h4">24</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Repartidores Activos</Typography>
            <Typography variant="h4">5</Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Pendientes</Typography>
            <Typography variant="h4">8</Typography>
          </Paper>
        </Stack>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Últimos Pedidos</Typography>
          <Typography variant="body1">Lista de pedidos recientes...</Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Repartidores</Typography>
          <Typography variant="body1">Monitoreo de repartidores...</Typography>
        </Paper>
      </Box>

      {/* Modal de Repartidores */}
      <Modal
        open={openRepartidores}
        onClose={handleCloseRepartidores}
        aria-labelledby="modal-repartidores"
        aria-describedby="modal-lista-repartidores"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lista de Repartidores
          </Typography>
          
          <List>
            {repartidores.map((repartidor, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={repartidor.nombre}
                  secondary={`${repartidor.estado} - Pedidos: ${repartidor.pedidos}`}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              onClick={handleCloseRepartidores}
              variant="contained"
              color="primary"
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default HomePage;