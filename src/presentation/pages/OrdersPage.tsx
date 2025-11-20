// src/presentation/pages/OrdersPage.tsx
import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useOrders } from '../../hooks/useOrders';
import { useDeliveries } from '../../hooks/useDeliveries';
import { Order } from '../../types/order';
import OrderForm from '../components/OrderForm';
import { AlertService } from '../../utils/alerts';

const OrdersPage: React.FC = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    assignDelivery,
    unassignDelivery,
  } = useOrders();

  const { deliveries } = useDeliveries();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormOpen(true);
  };

  const getOrderDisplayName = (order: Order) => {
    // Prioridad: nombre del pedido > nombre del cliente > ID
    if (order.nombre) return order.nombre;
    if (order.clienteNombre) return `Pedido de ${order.clienteNombre}`;
    return `Pedido #${order._id.slice(-6)}`;
  };

  const handleDelete = async (id: string, orderName?: string) => {
    setActionLoading(id);
    const success = await deleteOrder(id, orderName);
    setActionLoading(null);
  };

  const handleStatusChange = async (id: string, estado: Order['estado']) => {
    setActionLoading(id);
    await updateOrderStatus(id, estado);
    setActionLoading(null);
  };

  const handleAssignDelivery = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryId(order.repartidorAsignado || '');
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedOrder) return;

    setActionLoading(selectedOrder._id);
    
    try {
      let success = false;
      
      if (selectedDeliveryId) {
        // Asignar repartidor
        AlertService.loading('Asignando repartidor...', 'Procesando la asignación');
        success = await assignDelivery(selectedOrder._id, selectedDeliveryId);
        
        if (success) {
          const deliveryName = deliveries.find(d => d._id === selectedDeliveryId)?.nombre;
          AlertService.close();
          await AlertService.success(
            'Repartidor asignado',
            `El pedido #${selectedOrder._id.slice(-6)} ha sido asignado a ${deliveryName}`
          );
        }
      } else {
        // Desasignar repartidor
        AlertService.loading('Desasignando repartidor...', 'Procesando la desasignación');
        success = await unassignDelivery(selectedOrder._id);
        
        if (success) {
          AlertService.close();
          await AlertService.success(
            'Repartidor desasignado',
            `El pedido #${selectedOrder._id.slice(-6)} ya no tiene repartidor asignado`
          );
        }
      }
      
      if (!success) {
        AlertService.close();
      }
    } catch (error) {
      AlertService.close();
      await AlertService.error('Error en la asignación', 'No se pudo completar la operación');
    }
    
    setActionLoading(null);
    setAssignDialogOpen(false);
    setSelectedOrder(null);
    setSelectedDeliveryId('');
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedOrder) {
      return await updateOrder(selectedOrder._id, data);
    } else {
      return await createOrder(data);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'asignado': return 'info';
      case 'en_camino': return 'primary';
      case 'entregado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'asignado': return 'Asignado';
      case 'en_camino': return 'En Camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const statusFlow = {
      'pendiente': ['asignado', 'cancelado'],
      'asignado': ['en_camino', 'cancelado'],
      'en_camino': ['entregado', 'cancelado'],
      'entregado': [],
      'cancelado': ['pendiente'],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const activeDeliveries = deliveries.filter(d => d.activo);

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Encargos
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Nuevo Encargo
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Encargos</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'warning.light' }}>
          <Typography variant="h6">Pendientes</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => o.estado === 'pendiente').length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'info.light' }}>
          <Typography variant="h6">En Proceso</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => ['asignado', 'en_camino'].includes(o.estado)).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light' }}>
          <Typography variant="h6">Entregados</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => o.estado === 'entregado').length}
          </Typography>
        </Paper>
      </Stack>

      {/* Content */}
      {isMobile ? (
        // Mobile Cards View
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {order.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.clienteNombre}
                    </Typography>
                    {/* Editable Status */}
                    <FormControl size="small" sx={{ mt: 1, minWidth: 140 }}>
                      <Select
                        value={order.estado}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {[order.estado, ...getAvailableStatuses(order.estado)].map((estado) => (
                          <MenuItem key={estado} value={estado}>
                            <Chip
                              label={getStatusText(estado)}
                              color={getStatusColor(estado) as any}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(order)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleAssignDelivery(order)}
                      color="secondary"
                    >
                      <AssignIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(order._id, getOrderDisplayName(order))}
                      disabled={actionLoading === order._id}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{order.clienteTelefono}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {order.direccionEntrega}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ${order.precio.toFixed(2)}
                  </Typography>
                  {order.repartidorInfo && (
                    <Chip
                      label={`Repartidor: ${order.repartidorInfo.nombre}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entrega</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Repartidor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{order.nombre}</Typography>
                  </TableCell>
                  <TableCell>{order.clienteNombre}</TableCell>
                  <TableCell>{order.clienteTelefono}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                      {order.direccionEntrega}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      ${order.precio.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={order.estado}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {[order.estado, ...getAvailableStatuses(order.estado)].map((estado) => (
                          <MenuItem key={estado} value={estado}>
                            <Chip
                              label={getStatusText(estado)}
                              color={getStatusColor(estado) as any}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {order.repartidorInfo ? (
                      <Chip
                        label={order.repartidorInfo.nombre}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin asignar
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(order)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleAssignDelivery(order)}
                        color="secondary"
                      >
                        <AssignIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(order._id, getOrderDisplayName(order))}
                        disabled={actionLoading === order._id}
                        color="error"
                      >
                        {actionLoading === order._id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay encargos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comienza creando tu primer encargo
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Crear Encargo
          </Button>
        </Paper>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleCreate}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Order Form Dialog */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        order={selectedOrder}
        loading={loading}
      />

      {/* Assign Delivery Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>
          Asignar Repartidor
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Repartidor</InputLabel>
              <Select
                value={selectedDeliveryId}
                onChange={(e) => setSelectedDeliveryId(e.target.value)}
                label="Repartidor"
              >
                <MenuItem value="">
                  <em>Sin asignar</em>
                </MenuItem>
                {activeDeliveries.map((delivery) => (
                  <MenuItem key={delivery._id} value={delivery._id}>
                    {delivery.nombre} - {delivery.telefono}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            disabled={actionLoading === selectedOrder?._id}
          >
            {actionLoading === selectedOrder?._id ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
