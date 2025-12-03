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
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  Tooltip 
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
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useAdminSocket } from '../../hooks/useAdminSocket'; // <--- Hook del Socket
import { Delivery } from '../../types/delivery';
import DeliveryForm from '../components/DeliveryForm';
import theme from '../../theme/theme';
import { AlertService } from '../../utils/alerts';

const DeliveriesPage: React.FC = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Hooks de Datos
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

  // Hook de Socket para estado en tiempo real
  const { activeDeliveries: socketDeliveries } = useAdminSocket();

  const [formOpen, setFormOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [orderId, setOrderId] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // --- ESTADOS PARA PAGINACIÓN ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- 1. FUSIÓN DE DATOS (Igual que en HomePage) ---
  const synchronizedDeliveries = useMemo(() => {
    return deliveries.map((dbDelivery) => {
        // Buscar datos del socket para este repartidor
        const socketData = socketDeliveries.find(s => s.repartidorId === dbDelivery._id);
        
        // Determinar si está conectado
        const isOnline = socketData 
            ? (socketData.estado === 'conectado' || socketData.estado === 'activo' || socketData.estado === 'en_pausa') 
            : false;

        return {
            ...dbDelivery,
            isOnline, // Estado real de conexión
            statusText: socketData ? socketData.estado : 'desconectado' // Texto exacto (pausa, activo, etc)
        };
    });
  }, [deliveries, socketDeliveries]);

  // --- 2. FILTRADO PARA PAGINACIÓN ---
  const paginatedDeliveries = synchronizedDeliveries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // --- HELPERS VISUALES (Sincronizados con Home) ---
  const getConnectionColor = (statusText: string, isOnline: boolean) => {
      if (statusText === 'en_pausa') return 'warning'; // Naranja
      if (isOnline) return 'success'; // Verde
      return 'default'; // Gris
  };

  const getConnectionLabel = (statusText: string, isOnline: boolean) => {
      if (statusText === 'en_pausa') return 'En Pausa';
      if (isOnline) return 'Conectado';
      return 'Desconectado';
  };

  // --- MANEJADORES ---
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        `Cambiando estado de cuenta de ${deliveryName}`
      );
      
      const success = await toggleDeliveryStatus(id, currentStatus);
      
      AlertService.close();
      
      if (success) {
        await AlertService.success(
          `Cuenta ${newStatus ? 'activada' : 'desactivada'}`,
          `El acceso de ${deliveryName} ha sido actualizado.`
        );
      }
    } catch (error) {
      AlertService.close();
      await AlertService.error('Error', 'No se pudo actualizar la cuenta.');
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
    <Box sx={{ p: 3, height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }, overflowY: 'auto', pb: 10 }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
          Repartidores
        </Typography>
        {!isMobile && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ bgcolor: theme.palette.primary.main }}>
            Nuevo Repartidor
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards (Actualizados con datos reales) */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Total Registrados</Typography>
          <Typography variant="h4" fontWeight="bold">{deliveries.length}</Typography>
        </Paper>
        {/* Contadores basados en estado real del Socket */}
        <Paper sx={{ p: 2, flex: 1, bgcolor: theme.palette.primary.light, color: 'white' }}>
          <Typography variant="h6">Conectados (Online)</Typography>
          <Typography variant="h4" fontWeight="bold">
            {synchronizedDeliveries.filter(d => d.isOnline).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#f44336', color: 'white' }}>
          <Typography variant="h6">Desconectados</Typography>
          <Typography variant="h4" fontWeight="bold">
            {synchronizedDeliveries.filter(d => !d.isOnline).length}
          </Typography>
        </Paper>
      </Stack>

      {/* Content */}
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        {isMobile ? (
          // Mobile Cards View
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {paginatedDeliveries.map((delivery: any) => (
              <Card key={delivery._id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{delivery.nombre}</Typography>
                      {/* Chip de Conexión Real */}
                      <Chip
                        icon={delivery.isOnline ? <WifiIcon style={{ fontSize: 16 }} /> : <WifiOffIcon style={{ fontSize: 16 }} />}
                        label={getConnectionLabel(delivery.statusText, delivery.isOnline)}
                        color={getConnectionColor(delivery.statusText, delivery.isOnline) as any}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEdit(delivery)} color="primary"><EditIcon /></IconButton>
                      <Tooltip title={delivery.activo ? "Deshabilitar Cuenta" : "Habilitar Cuenta"}>
                          <IconButton size="small" onClick={() => handleToggleStatus(delivery._id, delivery.activo)} disabled={actionLoading === delivery._id} color={delivery.activo ? 'warning' : 'default'}>
                            {delivery.activo ? <ToggleOn /> : <ToggleOff />}
                          </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => handleDelete(delivery._id, delivery.nombre)} disabled={actionLoading === delivery._id} color="error"><DeleteIcon /></IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{delivery.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{delivery.telefono}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge badgeContent={delivery.pedidosAsignados.length} color="primary" sx={{ mr: 1 }}>
                        <AssignmentIcon fontSize="small" color="action" />
                      </Badge>
                      <Typography variant="body2">{delivery.pedidosAsignados.length} pedidos asignados</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Desktop Table View
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Pedidos</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Estado Conexión</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Cuenta</TableCell>
                  <TableCell sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDeliveries.map((delivery: any) => (
                  <TableRow key={delivery._id} hover>
                    <TableCell><Typography fontWeight="medium">{delivery.nombre}</Typography></TableCell>
                    <TableCell>{delivery.email}</TableCell>
                    <TableCell>{delivery.telefono}</TableCell>
                    <TableCell>
                      <Badge badgeContent={delivery.pedidosAsignados.length} color="primary" sx={{ mr: 2 }}>
                        <AssignmentIcon color="action" />
                      </Badge>
                    </TableCell>
                    {/* COLUMNA DE ESTADO REAL (SOCKET) */}
                    <TableCell>
                      <Chip
                        icon={delivery.isOnline ? <WifiIcon style={{ fontSize: 16 }} /> : <WifiOffIcon style={{ fontSize: 16 }} />}
                        label={getConnectionLabel(delivery.statusText, delivery.isOnline)}
                        color={getConnectionColor(delivery.statusText, delivery.isOnline) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    {/* COLUMNA DE ESTADO DE CUENTA (BD) */}
                    <TableCell>
                        <Chip 
                            label={delivery.activo ? "Habilitada" : "Deshabilitada"} 
                            color={delivery.activo ? "success" : "default"} 
                            size="small" 
                        />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEdit(delivery)} color="primary"><EditIcon /></IconButton>
                        <Tooltip title={delivery.activo ? "Deshabilitar acceso" : "Habilitar acceso"}>
                            <IconButton size="small" onClick={() => handleToggleStatus(delivery._id, delivery.activo)} disabled={actionLoading === delivery._id} color={delivery.activo ? 'warning' : 'default'}>
                                {delivery.activo ? <ToggleOn /> : <ToggleOff />}
                            </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={() => handleDelete(delivery._id, delivery.nombre)} disabled={actionLoading === delivery._id} color="error">
                            {actionLoading === delivery._id ? <CircularProgress size={20} /> : <DeleteIcon />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={deliveries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Paper>

      {/* Modales y Botones (Se mantienen igual) */}
      {deliveries.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No hay repartidores registrados</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ bgcolor: theme.palette.primary.main }}>Agregar Repartidor</Button>
        </Paper>
      )}

      {isMobile && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16, bgcolor: theme.palette.primary.main }} onClick={handleCreate}><AddIcon /></Fab>
      )}

      <DeliveryForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} delivery={selectedDelivery} loading={loading} isEdit={!!selectedDelivery} />

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Pedido a {selectedDelivery?.nombre}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="ID del Pedido" type="text" fullWidth variant="outlined" value={orderId} onChange={(e) => setOrderId(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAssignSubmit} variant="contained" disabled={!orderId || actionLoading === `assign-${selectedDelivery?._id}`}>{actionLoading === `assign-${selectedDelivery?._id}` ? 'Asignando...' : 'Asignar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveriesPage;