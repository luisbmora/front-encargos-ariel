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
import theme from '../../theme/theme';

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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      setActionLoading(id);
      await deleteOrder(id);
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: Order['status']) => {
    setActionLoading(id);
    await updateOrderStatus(id, status);
    setActionLoading(null);
  };

  const handleAssignDelivery = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryId(order.deliveryId || '');
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedOrder) return;

    setActionLoading(selectedOrder.id);
    
    if (selectedDeliveryId) {
      await assignDelivery({
        orderId: selectedOrder.id,
        deliveryId: selectedDeliveryId,
      });
    } else {
      await unassignDelivery(selectedOrder.id);
    }
    
    setActionLoading(null);
    setAssignDialogOpen(false);
    setSelectedOrder(null);
    setSelectedDeliveryId('');
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedOrder) {
      return await updateOrder(selectedOrder.id, data);
    } else {
      return await createOrder(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'picked_up': return 'primary';
      case 'in_transit': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'assigned': return 'Asignado';
      case 'picked_up': return 'Recogido';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const statusFlow = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['picked_up', 'cancelled'],
      'picked_up': ['in_transit', 'cancelled'],
      'in_transit': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': ['pending'],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const activeDeliveries = deliveries.filter(d => d.isActive);

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
        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
          Pedidos
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Nuevo Pedido
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
        <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Total Pedidos</Typography>
          <Typography variant="h4" fontWeight="bold">{orders.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.primary.light, color: 'white' }}>
          <Typography variant="h6">Pendientes</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => o.status === 'pending').length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#4caf50', color: 'white' }}>
          <Typography variant="h6">En Proceso</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#2196f3', color: 'white' }}>
          <Typography variant="h6">Entregados</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter(o => o.status === 'delivered').length}
          </Typography>
        </Paper>
      </Stack>

      {/* Content */}
      {isMobile ? (
        // Mobile Cards View
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Pedido #{order.id.slice(-6)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customerName}
                    </Typography>
                    <Chip
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status) as any}
                      size="small"
                      sx={{ mt: 1 }}
                    />
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
                      onClick={() => handleDelete(order.id)}
                      disabled={actionLoading === order.id}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{order.customerPhone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {order.deliveryAddress}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ${order.totalAmount.toFixed(2)}
                  </Typography>
                  {order.deliveryName && (
                    <Chip
                      label={`Repartidor: ${order.deliveryName}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>

                {/* Status Change Buttons */}
                {getAvailableStatuses(order.status).length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getAvailableStatuses(order.status).map((status) => (
                      <Button
                        key={status}
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange(order.id, status as Order['status'])}
                        disabled={actionLoading === order.id}
                      >
                        {getStatusText(status)}
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entrega</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Repartidor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">#{order.id.slice(-6)}</Typography>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.customerPhone}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                      {order.deliveryAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      ${order.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.deliveryName ? (
                      <Chip
                        label={order.deliveryName}
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
                        onClick={() => handleDelete(order.id)}
                        disabled={actionLoading === order.id}
                        color="error"
                      >
                        {actionLoading === order.id ? (
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
            No hay pedidos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comienza creando tu primer pedido
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Crear Pedido
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
            bgcolor: theme.palette.primary.main,
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
                  <MenuItem key={delivery.id} value={delivery.id}>
                    {delivery.name} - {delivery.vehicleType}
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
            disabled={actionLoading === selectedOrder?.id}
          >
            {actionLoading === selectedOrder?.id ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;