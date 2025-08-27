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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff,
  ToggleOn,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useDeliveries } from '../../hooks/useDeliveries';
import { Delivery } from '../../types/delivery';
import DeliveryForm from '../components/DeliveryForm';
import theme from '../../theme/theme';

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
  } = useDeliveries();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedDelivery(null);
    setFormOpen(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este repartidor?')) {
      setActionLoading(id);
      await deleteDelivery(id);
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActionLoading(id);
    await toggleDeliveryStatus(id);
    setActionLoading(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedDelivery) {
      return await updateDelivery(selectedDelivery.id, data);
    } else {
      return await createDelivery(data);
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels = {
      motorcycle: 'Motocicleta',
      bicycle: 'Bicicleta',
      car: 'Automóvil',
      walking: 'A pie',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getVehicleIcon = (type: string) => {
    const icons = {
      motorcycle: '🏍️',
      bicycle: '🚲',
      car: '🚗',
      walking: '🚶',
    };
    return icons[type as keyof typeof icons] || '🚚';
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
            {deliveries.filter(d => d.isActive).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#f44336', color: 'white' }}>
          <Typography variant="h6">Inactivos</Typography>
          <Typography variant="h4" fontWeight="bold">
            {deliveries.filter(d => !d.isActive).length}
          </Typography>
        </Paper>
      </Stack>

      {/* Content */}
      {isMobile ? (
        // Mobile Cards View
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {delivery.name}
                    </Typography>
                    <Chip
                      label={delivery.isActive ? 'Activo' : 'Inactivo'}
                      color={delivery.isActive ? 'success' : 'error'}
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
                      onClick={() => handleToggleStatus(delivery.id)}
                      disabled={actionLoading === delivery.id}
                      color={delivery.isActive ? 'warning' : 'success'}
                    >
                      {delivery.isActive ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(delivery.id)}
                      disabled={actionLoading === delivery.id}
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
                    <Typography variant="body2">{delivery.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {getVehicleIcon(delivery.vehicleType)} {getVehicleTypeLabel(delivery.vehicleType)}
                    </Typography>
                    {delivery.vehiclePlate && (
                      <Chip label={delivery.vehiclePlate} size="small" variant="outlined" />
                    )}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vehículo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Placa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{delivery.name}</Typography>
                  </TableCell>
                  <TableCell>{delivery.email}</TableCell>
                  <TableCell>{delivery.phone}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{getVehicleIcon(delivery.vehicleType)}</Typography>
                      <Typography>{getVehicleTypeLabel(delivery.vehicleType)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {delivery.vehiclePlate ? (
                      <Chip label={delivery.vehiclePlate} size="small" variant="outlined" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.isActive ? 'Activo' : 'Inactivo'}
                      color={delivery.isActive ? 'success' : 'error'}
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
                        onClick={() => handleToggleStatus(delivery.id)}
                        disabled={actionLoading === delivery.id}
                        color={delivery.isActive ? 'warning' : 'success'}
                      >
                        {actionLoading === delivery.id ? (
                          <CircularProgress size={20} />
                        ) : delivery.isActive ? (
                          <ToggleOn />
                        ) : (
                          <ToggleOff />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(delivery.id)}
                        disabled={actionLoading === delivery.id}
                        color="error"
                      >
                        {actionLoading === delivery.id ? (
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
      />
    </Box>
  );
};

export default DeliveriesPage;