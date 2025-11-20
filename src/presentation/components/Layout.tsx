// src/presentation/components/Layout.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/AltRoute';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WifiIcon from '@mui/icons-material/Wifi';
import theme from '../../theme/theme';
import { useAuth } from '../../app/AuthContext';
import { useNavigation } from '../../app/NavigationContext';
import { useSocket } from '../../hooks/useSocket';
import TokenExpiryWarning from './TokenExpiryWarning';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const { currentPage, setCurrentPage } = useNavigation();
  const { isConnected } = useSocket();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon sx={{ color: 'white' }} />, 
      page: 'dashboard' as const 
    },
    { 
      text: 'Pedidos', 
      icon: <AssignmentIcon sx={{ color: 'white' }} />, 
      page: 'orders' as const 
    },
    { 
      text: 'Repartidores', 
      icon: <PeopleIcon sx={{ color: 'white' }} />, 
      page: 'deliveries' as const 
    },
    { 
      text: 'Rutas', 
      icon: <RouteIcon sx={{ color: 'white' }} />, 
      page: 'routes' as const 
    },
    {
      text: 'Cerrar Sesión',
      icon: <LogoutIcon sx={{ color: 'white' }} />,
      action: logout,
    },
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
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={item.action || (() => item.page && setCurrentPage(item.page))}
              selected={item.page === currentPage}
              sx={{
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                '&.Mui-selected': { 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Bar */}
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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Connection Status */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isConnected ? 'success.main' : 'error.main',
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Typography>
          </Box>
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
          mt: 8,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>

      {/* Token Expiry Warning */}
      <TokenExpiryWarning />
    </Box>
  );
};

export default Layout;