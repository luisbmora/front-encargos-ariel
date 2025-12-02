import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Fab,
  TablePagination,
  Menu,
  MenuItem,
  Tooltip // Agregado para mostrar info al pasar el mouse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  PhotoLibrary as PhotoLibraryIcon // Icono para múltiples fotos
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useOrders } from '../../hooks/useOrders';
import { Order } from '../../types/order';
import OrderForm from '../components/OrderForm';
import theme from '../../theme/theme';
import { AlertService } from '../../utils/alerts';

const OrdersPage: React.FC = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Hooks - Asegúrate de que tu hook useOrders exporte updateOrder y deleteOrder
  const {
    orders,
    loading,
    error,
    createOrder,
    updateOrder, 
    deleteOrder, 
  } = useOrders();

  // Estados locales
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Menu de acciones
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOrder, setMenuOrder] = useState<Order | null>(null);

  // --- 1. ORDENAMIENTO (Más reciente primero) ---
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
        const dateA = new Date(a.fechaCreacion).getTime();
        const dateB = new Date(b.fechaCreacion).getTime();
        return dateB - dateA; // Descendente (Más nuevo arriba)
    });
  }, [orders]);

  // --- 2. PAGINACIÓN ---
  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- MANEJADORES ---
  const handleCreate = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormOpen(true);
    handleCloseMenu();
  };

  const handleDelete = async (order: Order) => {
    handleCloseMenu();
    
    // Confirmación antes de borrar
    const confirmed = window.confirm(`¿Estás seguro de eliminar el pedido de ${order.clienteNombre}?`);
    
    if (confirmed && deleteOrder) {
        try {
            await deleteOrder(order._id);
        } catch (error) {
            console.error("Error al eliminar orden", error);
        }
    }
  };

  const handleFormSubmit = async (data: any) => {
    // data ya viene como un objeto JSON limpio gracias al OrderForm actualizado
    if (selectedOrder) {
      if (updateOrder) {
          return await updateOrder(selectedOrder._id, data);
      }
      return false;
    } else {
      return await createOrder(data);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setMenuOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOrder(null);
  };

  // Helper para colores de estado
  const getStatusColor = (status: string) => {
    switch (status) {
        case 'entregado': return 'success';
        case 'en_camino': return 'primary';
        case 'asignado': return 'info';
        case 'cancelado': return 'error';
        default: return 'warning'; // pendiente
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // --- CORRECCIÓN VISUAL: ALTO DINÁMICO + SCROLL ---
    <Box sx={{ 
      p: 3, 
      height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }, // Resta altura del header
      overflowY: 'auto', // Habilita el scroll vertical
      pb: 10 // Espacio al final para que no se corte
    }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
          Encargos
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Nuevo Encargo
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tarjetas de Resumen (Stats) */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Encargos</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'warning.light' }}>
          <Typography variant="h6">Pendientes</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.filter(o => o.estado === 'pendiente').length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'info.light' }}>
          <Typography variant="h6">En Proceso</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.filter(o => ['asignado', 'en_camino'].includes(o.estado)).length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light', color: 'white' }}>
          <Typography variant="h6">Entregados</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.filter(o => o.estado === 'entregado').length}</Typography>
        </Paper>
      </Stack>

      {/* Contenido Principal */}
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        {isMobile ? (
          // VISTA MÓVIL (TARJETAS)
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {paginatedOrders.map((order) => (
              <Card key={order._id} variant="outlined">
                <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight="bold">{order.nombre}</Typography>
                        <Chip 
                            label={order.estado.toUpperCase()} 
                            color={getStatusColor(order.estado) as any} 
                            size="small" 
                        />
                    </Box>
                    
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">{order.clienteNombre}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" noWrap>{order.direccionEntrega}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                                ${order.precio.toFixed(2)}
                            </Typography>
                            <Box>
                                <IconButton size="small" color="primary" onClick={() => handleEdit(order)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(order)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // VISTA ESCRITORIO (TABLA)
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Entrega</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Repartidor</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order: any) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                        <Box display="flex" alignItems="center">
                            <Typography fontWeight="medium">{order.nombre}</Typography>
                            {/* Mostrar icono si tiene fotos */}
                            {(order.imagenUrl || (order.fotos && order.fotos.length > 0)) && (
                                <Tooltip title="Tiene imágenes adjuntas">
                                    {order.fotos && order.fotos.length > 1 ? (
                                        <PhotoLibraryIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                                    ) : (
                                        <DescriptionIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                                    )}
                                </Tooltip>
                            )}
                        </Box>
                    </TableCell>
                    <TableCell>{order.clienteNombre}</TableCell>
                    <TableCell>{order.clienteTelefono}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.direccionEntrega}
                    </TableCell>
                    <TableCell>
                        <Typography color="success.main" fontWeight="bold">${order.precio.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.estado}
                        color={getStatusColor(order.estado) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {typeof order.repartidorAsignado === 'object' && order.repartidorAsignado 
                                ? (order.repartidorAsignado as any).nombre 
                                : order.repartidorAsignado ? 'Asignado (ID)' : 'Sin asignar'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(order)}>
                            <EditIcon />
                        </IconButton>
                         <IconButton size="small" color="error" onClick={() => handleDelete(order)}>
                            <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Botón flotante móvil */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreate}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Modal de Formulario */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        order={selectedOrder}
        loading={loading}
      />
      
      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => menuOrder && handleDelete(menuOrder)}>Eliminar</MenuItem>
      </Menu>

    </Box>
  );
};

export default OrdersPage;