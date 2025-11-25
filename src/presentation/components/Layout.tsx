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
  CSSObject,
  Theme,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/AltRoute';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import theme from '../../theme/theme';
import { useAuth } from '../../app/AuthContext';
import { useNavigation } from '../../app/NavigationContext';
import { useSocket } from '../../hooks/useSocket';
import TokenExpiryWarning from './TokenExpiryWarning';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { logout } = useAuth();
  const { currentPage, setCurrentPage } = useNavigation();
  const { isConnected } = useSocket();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' as const },
    { text: 'Pedidos', icon: <AssignmentIcon />, page: 'orders' as const },
    { text: 'Repartidores', icon: <PeopleIcon />, page: 'deliveries' as const },
    { text: 'Rutas', icon: <RouteIcon />, page: 'routes' as const },
    { text: 'Cerrar Sesión', icon: <LogoutIcon />, action: logout },
  ];

  const drawerContent = (
    <Box sx={{ bgcolor: theme.palette.primary.main, height: '100%', color: 'white' }}>
      <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          opacity: open ? 1 : 0, 
          transition: 'opacity 0.2s',
          minHeight: 64,
          overflow: 'hidden'
        }}>
        {open && (
           <>
            <LocalShippingIcon sx={{ fontSize: 30, mr: 1, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              Ncargos Ariel
            </Typography>
           </>
        )}
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={item.action || (() => item.page && setCurrentPage(item.page))}
              selected={item.page === currentPage}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                '&.Mui-selected': { 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: theme.palette.primary.main }}>
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
          
           <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isConnected ? 'success.main' : 'error.main', mr: 1 }} />
            <Typography variant="body2">{isConnected ? 'Conectado' : 'Desconectado'}</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <StyledDrawer
        variant="permanent"
        open={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <DrawerHeader />
        {drawerContent}
      </StyledDrawer>

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
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 0, height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <DrawerHeader />
        {children}
      </Box>

      <TokenExpiryWarning />
    </Box>
  );
};

export default Layout;