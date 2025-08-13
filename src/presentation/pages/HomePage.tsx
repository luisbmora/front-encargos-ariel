// src/presentation/pages/HomePage.tsx
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/AltRoute';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from '../../theme/theme';
import { useState } from 'react';
import { useAuth } from '../../app/AuthContext';

const drawerWidth = 240;

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Pedidos', icon: <AssignmentIcon sx={{ color: 'white' }} /> },
    { text: 'Repartidores', icon: <PeopleIcon sx={{ color: 'white' }} /> },
    { text: 'Rutas', icon: <RouteIcon sx={{ color: 'white' }} /> },
    { text: 'Cerrar Sesión', icon: <LogoutIcon sx={{ color: 'white' }} />, action: logout },
  ];

  const drawer = (
    <Box sx={{ bgcolor: theme.palette.primary.main, height: '100%', color: 'white' }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <LocalShippingIcon sx={{ fontSize: 36, mr: 1, color: theme.palette.secondary.main }} />
        <Typography variant="h6" fontWeight="bold">
          Ncargos Ariel
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      {/* Menú */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.action || (() => {})}
            sx={{
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: 'white' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Bar morada */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* Título */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
          Panel de Control
        </Typography>

        {/* Tarjetas métricas */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Pedidos Hoy</Typography>
            <Typography variant="h4" fontWeight="bold">24</Typography>
          </Paper>
          <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Repartidores Activos</Typography>
            <Typography variant="h4" fontWeight="bold">5</Typography>
          </Paper>
          <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
            <Typography variant="h6">Pendientes</Typography>
            <Typography variant="h4" fontWeight="bold">8</Typography>
          </Paper>
        </Stack>

        {/* Últimos pedidos */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Últimos Pedidos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lista de pedidos recientes...
          </Typography>
        </Paper>

        {/* Monitoreo repartidores */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Monitoreo de Repartidores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Estado y ubicación de los repartidores...
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
