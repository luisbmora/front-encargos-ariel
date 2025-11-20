// src/presentation/pages/DeliveriesPage.tsx
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
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff,
  ToggleOn,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useDeliveries } from '../../hooks/useDeliveries';
import { Delivery } from '../../types/delivery';
import DeliveryForm from '../components/DeliveryForm';
import theme from '../../theme/theme';
import { AlertService } from '../../utils/alerts';

const DeliveriesPage: React.FC = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const {
    deliveries,
    loading,
    error,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    toggleDeliveryStatus,
    assignOrder,
  } = useDeliveries();

  const [formOpen, setFormOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [orderId, setOrderId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedDelivery(null);
    setFormOpen(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormOpen(true);
  };

  const handleDelete = async (id: string, deliveryName?: string) => {
    setActionLoading(id);
    const success = await deleteDelivery(id, deliveryName);
    setActionLoading(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    
    try {
      const deliveryName = deliveries.find(d => d._id === id)?.nombre || 'Repartidor';
      const newStatus = !currentStatus;
      
      AlertService.loading(
        `${newStatus ? 'Activando' : 'Desactivando'} repartidor...`,
        `Cambiando estado de ${deliveryName}`
      );
      
      const success = await toggleDeliveryStatus(id, currentStatus);
      
      AlertService.close();
      
      if (success) {
        await AlertService.success(
          `Repartidor ${newStatus ? 'activado' : 'desactivado'}`,
          `${deliveryName} ahora está ${newStatus ? 'activo' : 'inactivo'}`
        );
      }
    } catch (error) {
      AlertService.close();
      await AlertService.error('Error al cambiar estado', 'No se pudo actualizar el estado del repartidor');
    }
    
    setActionLoading(null);
  };

  const handleAssignOrder = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (selectedDelivery && orderId) {
      setActionLoading(`assign-${selectedDelivery._id}`);
      const success = await assignOrder(selectedDelivery._id, orderId);
      setActionLoading(null);
      
      if (success) {
        setAssignDialogOpen(false);
        setOrderId('');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedDelivery) {
      return await updateDelivery(selectedDelivery._id, data);
    } else {
      return await createDelivery(data);
    }
  };

  if (loading && deliveries.length === 0) {
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
          Repartidores
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Nuevo Repartidor
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
          <Typography variant="h6">Total Repartidores</Typography>
          <Typography variant="h4" fontWeight="bold">{deliveries.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.primary.light, color: 'white' }}>
          <Typography variant="h6">Activos</Typography>
          <Typography variant="h4" fontWeight="bold">
            {deliveries.filter(d => d.activo).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#f44336', color: 'white' }}>
          <Typography variant="h6">Inactivos</Typography>
          <Typography variant="h4" fontWeight="bold">
            {deliveries.filter(d => !d.activo).length}
          </Typography>
        </Paper>
      </Stack>

      {/* Content */}
      {isMobile ? (
        // Mobile Cards View
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {deliveries.map((delivery) => (
            <Card key={delivery._id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {delivery.nombre}
                    </Typography>
                    <Chip
                      label={delivery.activo ? 'Activo' : 'Inactivo'}
                      color={delivery.activo ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(delivery)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(delivery._id, delivery.activo)}
                      disabled={actionLoading === delivery._id}
                      color={delivery.activo ? 'warning' : 'success'}
                    >
                      {delivery.activo ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(delivery._id, delivery.nombre)}
                      disabled={actionLoading === delivery._id}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{delivery.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{delivery.telefono}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge 
                      badgeContent={delivery.pedidosAsignados.length} 
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <AssignmentIcon fontSize="small" color="action" />
                    </Badge>
                    <Typography variant="body2">
                      {delivery.pedidosAsignados.length} pedidos asignados
                    </Typography>
                  </Box>
                </Box>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pedidos Asignados</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery._id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{delivery.nombre}</Typography>
                  </TableCell>
                  <TableCell>{delivery.email}</TableCell>
                  <TableCell>{delivery.telefono}</TableCell>
                  <TableCell>
                    <Badge 
                      badgeContent={delivery.pedidosAsignados.length} 
                      color="primary"
                      sx={{ mr: 2 }}
                    >
                      <AssignmentIcon />
                    </Badge>
                    
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.activo ? 'Activo' : 'Inactivo'}
                      color={delivery.activo ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(delivery)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(delivery._id, delivery.activo)}
                        disabled={actionLoading === delivery._id}
                        color={delivery.activo ? 'warning' : 'success'}
                      >
                        {actionLoading === delivery._id ? (
                          <CircularProgress size={20} />
                        ) : delivery.activo ? (
                          <ToggleOn />
                        ) : (
                          <ToggleOff />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(delivery._id, delivery.nombre)}
                        disabled={actionLoading === delivery._id}
                        color="error"
                      >
                        {actionLoading === delivery._id ? (
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
      {deliveries.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay repartidores registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comienza agregando tu primer repartidor
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Agregar Repartidor
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

      {/* Form Dialog */}
      <DeliveryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        delivery={selectedDelivery}
        loading={loading}
        isEdit={!!selectedDelivery}
      />

      {/* Assign Order Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Asignar Pedido a {selectedDelivery?.nombre}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID del Pedido"
            type="text"
            fullWidth
            variant="outlined"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAssignSubmit} 
            variant="contained"
            disabled={!orderId || actionLoading === `assign-${selectedDelivery?._id}`}
          >
            {actionLoading === `assign-${selectedDelivery?._id}` ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveriesPage;