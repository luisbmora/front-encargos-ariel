import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Snackbar
} from "@mui/material";

// Iconos
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import WifiIcon from '@mui/icons-material/Wifi'; 
import WifiOffIcon from '@mui/icons-material/WifiOff'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';

// Hooks
import { useOrders } from "../../hooks/useOrders";
import { useDeliveries } from "../../hooks/useDeliveries";
import { useAdminSocket } from "../../hooks/useAdminSocket"; 

// Types
import { Order } from "../../types/order";
import { Delivery } from "../../types/delivery";

// Components
import BasicMap from "../components/BasicMap";
import OrderForm from "../components/OrderForm"; 

export default function HomePage() {
  const { orders, assignDelivery, createOrder, updateOrderStatus } = useOrders(); 
  const { deliveries } = useDeliveries(); 
  
  // SOCKET: Obtenemos datos en tiempo real
  const { activeDeliveries: socketDeliveries, isConnected, enviarNotificacion, socketId, currentRoom } = useAdminSocket();

  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  
  // Estados de Modales
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<any>(null);
  const [orderToAssign, setOrderToAssign] = useState<any>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
  
  // Estados de Acción
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // 1. FUSIÓN DE DATOS (Socket + BD) CON ORDENAMIENTO
  const mappedDeliveries = useMemo(() => {
    // Fallback: Si no hay BD, usamos solo socket
    if (deliveries.length === 0 && socketDeliveries.length > 0) {
        const fallbackList = socketDeliveries.map((loc) => ({
            id: loc.repartidorId,
            name: `Repartidor ${loc.repartidorId.substring(0,4)}...`,
            location: { lat: loc.latitud || 0, lng: loc.longitud || 0 },
            isActive: loc.estado !== 'desconectado' && loc.estado !== 'inactivo',
            statusText: loc.estado,
            phone: '',
            vehicleType: 'motorcycle'
        }));
        
        // Ordenar: Activos primero
        return fallbackList.sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1));
    }

    // Fusión Principal
    const mergedList = deliveries.map((dbDelivery: Delivery) => {
      const realLoc = socketDeliveries.find(loc => loc.repartidorId === dbDelivery._id);
      
      const defaultLocation = { lat: 20.659698, lng: -103.349609 }; 
      const finalLocation = realLoc && (realLoc.latitud !== 0)
        ? { lat: realLoc.latitud, lng: realLoc.longitud }
        : defaultLocation;

      const isOnline = realLoc 
        ? (realLoc.estado !== 'desconectado' && realLoc.estado !== 'inactivo') 
        : false;

      return {
        id: dbDelivery._id,
        name: dbDelivery.nombre,
        location: finalLocation,
        isActive: isOnline,
        statusText: realLoc ? realLoc.estado : 'desconectado', // Estado exacto para colores
        phone: dbDelivery.telefono,
        vehicleType: 'motorcycle', 
        avatarUrl: '' 
      };
    });

    // --- ORDENAMIENTO AUTOMÁTICO ---
    // Los que están "isActive: true" van primero (-1), los inactivos después (1)
    return mergedList.sort((a, b) => {
        if (a.isActive === b.isActive) return 0; // Si el estado es igual, no cambia el orden
        return a.isActive ? -1 : 1; // Activos arriba
    });

  }, [deliveries, socketDeliveries]);

  // 2. ORDENES
  const mappedOrders = useMemo(() => {
    return orders
        .filter((o: Order) => ['pendiente', 'asignado', 'en_camino'].includes(o.estado))
        .map((o: Order) => ({
            ...o,
            id: o._id,
            title: o.clienteNombre,
            description: o.descripcion,
            total: o.precio,
            state: o.estado,
            address: o.direccionEntrega,
            repartidorAsignado: o.repartidorAsignado, 
            location: { lat: 20.66, lng: -103.35 } 
        }));
  }, [orders]);

  // 3. FILTRADO DE LISTA
  const filteredList = useMemo(() => {
    if (tabIndex === 0) {
      return mappedDeliveries.filter(d => 
        d.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return mappedOrders.filter(o => 
         o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         o.id?.includes(searchTerm)
      );
    }
  }, [tabIndex, mappedDeliveries, mappedOrders, searchTerm]);

  // FUNCIÓN: Obtener pedidos de un repartidor
  const getDriverOrders = (driverId: string, includeHistory = false) => {
    return orders.filter(o => {
        const assignedId = typeof o.repartidorAsignado === 'object' && o.repartidorAsignado !== null
            ? (o.repartidorAsignado as any)._id 
            : o.repartidorAsignado;
        const isSameDriver = String(assignedId) === String(driverId);
        
        if (!isSameDriver) return false;

        if (includeHistory) {
            return ['asignado', 'en_camino', 'entregado', 'cancelado'].includes(o.estado);
        }
        return ['asignado', 'en_camino'].includes(o.estado);
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSearchTerm("");
  };

  // ASIGNACIÓN
  const handleAssignConfirm = async () => {
      if (!orderToAssign || !selectedDriverId) return;
      try {
          setIsAssigning(true);
          await assignDelivery(orderToAssign.id, selectedDriverId);
          
          enviarNotificacion('asignacion', {
             repartidorId: selectedDriverId,
             encargoId: orderToAssign.id,
             titulo: '¡Nuevo Pedido!',
             mensaje: `Tienes un pedido para ${orderToAssign.clienteNombre}.`,
             extraData: {
                 direccion: orderToAssign.direccionEntrega,
                 cliente: orderToAssign.clienteNombre,
                 telefono: orderToAssign.clienteTelefono
             }
          });

          setOrderToAssign(null);
          setSelectedDriverId('');
          setTabIndex(0);
      } catch (error) {
          console.error("Error al asignar", error);
          setErrorAlert("Error al asignar el pedido.");
      } finally {
          setIsAssigning(false);
      }
  };

  // CREAR ORDEN
  const handleCreateOrderSubmit = async (data: any) => {
    try {
        const success = await createOrder(data);
        if (success) {
            setIsCreateOrderOpen(false);
        }
        return success;
    } catch (error) {
        console.error("Error creando orden:", error);
        return false;
    }
  };

  // CAMBIAR ESTATUS
  const handleChangeStatus = async (event: SelectChangeEvent) => {
    if (!selectedOrderForDetails) return;
    
    const newStatus = event.target.value as 'pendiente' | 'asignado' | 'en_camino' | 'entregado' | 'cancelado';

    // Validación
    if (['asignado', 'en_camino'].includes(newStatus) && !selectedOrderForDetails.repartidorAsignado) {
        setErrorAlert("⚠️ No puedes cambiar a 'En Camino' o 'Asignado' sin asignar un repartidor primero.");
        return; 
    }

    try {
        setIsUpdatingStatus(true);
        if (updateOrderStatus) {
            await updateOrderStatus(selectedOrderForDetails._id, newStatus);
            setSelectedOrderForDetails((prev: any) => ({ ...prev, estado: newStatus }));
        }
    } catch (error) {
        console.error("Error actualizando estatus:", error);
        setErrorAlert("Error al actualizar el estatus.");
    } finally {
        setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  // HELPER PARA COLOR DE ESTADO EN LISTA
  const getStatusColor = (statusText: string, isActive: boolean) => {
      if (statusText === 'en_pausa') return '#ff9800'; // Naranja
      if (isActive) return '#4caf50'; // Verde
      return '#bdbdbd'; // Gris
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      
      {/* Mapa */}
      <BasicMap 
        deliveries={mappedDeliveries} 
        orders={mappedOrders} 
      />

      {/* Panel Flotante */}
      {panelOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 380,
            maxHeight: 'calc(100vh - 100px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ bgcolor: '#0a3d35', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight="bold">Panel de Control</Typography>
                  <Tooltip title={isConnected ? `ID: ${socketId} | Sala: ${currentRoom || 'Admin'}` : "Desconectado del servidor"}>
                    <Chip 
                        icon={isConnected ? <WifiIcon style={{color:'white', width:14}}/> : <WifiOffIcon style={{color:'white', width:14}}/>}
                        label={isConnected ? "Live" : "Offline"}
                        size="small"
                        sx={{ bgcolor: isConnected ? '#4caf50' : '#f44336', color: 'white', height: 20, fontSize: '0.65rem', cursor: 'help', '& .MuiChip-label': { px: 1 } }}
                    />
                  </Tooltip>
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setPanelOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<PersonIcon />} iconPosition="start" label="REPARTIDORES" />
            <Tab icon={<InventoryIcon />} iconPosition="start" label="ORDENES" />
          </Tabs>

          <Box sx={{ p: 2, pb: 1 }}>
            <TextField fullWidth size="small" placeholder={tabIndex === 0 ? "Buscar repartidor..." : "Buscar orden #..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>RESULTADOS: {filteredList.length}</Typography>
          </Box>

          {tabIndex === 1 && (
            <Box sx={{ px: 2, pb: 1 }}>
                <Button fullWidth variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setIsCreateOrderOpen(true)} sx={{ borderRadius: 2 }}>Nueva Orden</Button>
            </Box>
          )}

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1, bgcolor: '#f8f9fa' }}>
            
            {!isConnected && tabIndex === 0 && socketDeliveries.length === 0 && (
                 <Box display="flex" justifyContent="center" p={2} alignItems="center" gap={1}>
                    <CircularProgress size={16}/><Typography variant="caption" color="text.secondary">Conectando al servidor...</Typography>
                 </Box>
            )}

            <List>
              {filteredList.map((item: any) => {
                const activeOrders = tabIndex === 0 ? getDriverOrders(item.id, false) : [];
                const activeCount = activeOrders.length;

                return (
                <Paper key={item.id} elevation={0} variant="outlined" sx={{ mb: 1, borderRadius: 2, bgcolor: 'white', overflow: 'hidden' }}>
                  {tabIndex === 0 ? (
                    // REPARTIDOR
                    <>
                      <ListItemButton alignItems="flex-start" onClick={() => setSelectedDriverForModal(item)}>
                        <ListItemAvatar>
                          <Box position="relative">
                            <Badge badgeContent={activeCount} color="error" overlap="circular">
                                <Avatar sx={{ bgcolor: theme => theme.palette.primary.main }}>
                                    {item.name ? item.name.charAt(0).toUpperCase() : "R"}
                                </Avatar>
                            </Badge>
                            {/* INDICADOR DE ESTADO (COLOR) */}
                            <Box
                              sx={{
                                position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', border: '2px solid white',
                                bgcolor: getStatusColor(item.statusText, item.isActive) // <--- LÓGICA DE COLOR
                              }}
                            />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="subtitle2" fontWeight="bold" component="div">{item.name}</Typography>}
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={
                            <Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    {item.vehicleType === 'car' ? <DirectionsCarIcon fontSize="inherit"/> : <TwoWheelerIcon fontSize="inherit"/>}
                                    <Typography variant="caption">{item.vehicleType === 'car' ? 'Auto' : 'Moto'}</Typography>
                                </Box>
                                <Typography variant="caption" display="block" 
                                    sx={{ 
                                        color: item.statusText === 'en_pausa' ? 'warning.main' : (item.isActive ? 'success.main' : 'text.disabled'),
                                        fontWeight: item.isActive ? 'bold' : 'normal'
                                    }}>
                                    {item.statusText === 'en_pausa' ? 'En Pausa ⏸️' : (item.isActive ? 'Conectado ✅' : 'Desconectado ❌')}
                                </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                      <Divider />
                      <Box sx={{ display: 'flex', p: 1, gap: 1 }}>
                        <Button fullWidth variant="outlined" size="small" color={activeCount > 0 ? "primary" : "inherit"} startIcon={<ReceiptLongIcon />} onClick={() => setSelectedDriverForModal(item)}>
                            {activeCount > 0 ? `Ver ${activeCount} Activos` : "Ver Historial"}
                        </Button>
                      </Box>
                    </>
                  ) : (
                    // ORDEN
                    <>
                       <ListItemButton alignItems="flex-start" onClick={() => setSelectedOrderForDetails(item)}>
                         <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Chip label={`#${item.id.substring(item.id.length - 6).toUpperCase()}`} size="small" color="default" variant="outlined" />
                                <Typography variant="subtitle2" fontWeight="bold" color="success.main">${item.total ? item.total.toFixed(2) : '0.00'}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold" gutterBottom component="div">{item.title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>📍 {item.address || 'Sin dirección'}</Typography>
                            {item.state === 'pendiente' ? (
                                <Button fullWidth variant="contained" color="warning" size="small" startIcon={<PersonAddIcon />} sx={{ boxShadow: 'none', mt: 1 }} onClick={(e) => { e.stopPropagation(); setOrderToAssign(item) }}>ASIGNAR REPARTIDOR</Button>
                            ) : (
                                <Button fullWidth variant={item.state === 'en_camino' ? "outlined" : "contained"} color="primary" size="small" sx={{ boxShadow: 'none', mt: 1 }} disabled>{item.state === 'en_camino' ? 'EN RUTA' : item.state.toUpperCase()}</Button>
                            )}
                         </Box>
                       </ListItemButton>
                    </>
                  )}
                </Paper>
              );
             })}
            </List>
          </Box>
        </Paper>
      )}

      {!panelOpen && (
        <Button variant="contained" color="primary" onClick={() => setPanelOpen(true)} sx={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>Abrir Panel</Button>
      )}

      {/* --- MODALES --- */}
      
      <Dialog open={!!selectedDriverForModal} onClose={() => setSelectedDriverForModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0a3d35', color: 'white' }}>
            {selectedDriverForModal?.name}
            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>Actividad del día</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            {selectedDriverForModal && getDriverOrders(selectedDriverForModal.id, true).length > 0 ? (
                <List disablePadding>
                    {getDriverOrders(selectedDriverForModal.id, true).map((order) => {
                        const isFinished = order.estado === 'entregado' || order.estado === 'cancelado';
                        return (
                        <Paper key={order._id} variant="outlined" sx={{ mb: 2, p: 2, cursor: 'pointer', opacity: isFinished ? 0.8 : 1, bgcolor: isFinished ? '#fafafa' : 'white' }} onClick={() => setSelectedOrderForDetails(order)}>
                             <Box display="flex" justifyContent="space-between" mb={1}>
                                <Chip label={`#${order._id.substring(order._id.length - 6).toUpperCase()}`} size="small" color="primary" />
                                <Chip icon={isFinished ? <CheckCircleIcon/> : undefined} label={order.estado.toUpperCase().replace('_', ' ')} size="small" color={order.estado === 'entregado' ? 'success' : 'primary'} variant={isFinished ? "filled" : "outlined"} />
                            </Box>
                             <Typography variant="h6" fontSize="1rem">{order.clienteNombre}</Typography>
                             <Typography variant="body2" color="text.secondary">📍 {order.direccionEntrega}</Typography>
                        </Paper>
                    )})}
                </List>
            ) : (
                <Box textAlign="center" py={4}><Typography color="text.secondary">Sin actividad registrada hoy.</Typography></Box>
            )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedDriverForModal(null)}>Cerrar</Button></DialogActions>
      </Dialog>

      <Dialog open={!!orderToAssign} onClose={() => setOrderToAssign(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: theme => theme.palette.warning.main, color: '#fff' }}>Asignar Encargo</DialogTitle>
        <DialogContent dividers>
             <RadioGroup value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                <List disablePadding>
                    {mappedDeliveries.filter(d => d.isActive).map((driver) => (
                        <ListItemButton key={driver.id} onClick={() => setSelectedDriverId(driver.id)} selected={selectedDriverId === driver.id}>
                            <FormControlLabel value={driver.id} control={<Radio />} label={driver.name} />
                        </ListItemButton>
                    ))}
                </List>
             </RadioGroup>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOrderToAssign(null)}>Cancelar</Button>
            <Button onClick={handleAssignConfirm} variant="contained" disabled={!selectedDriverId}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedOrderForDetails} onClose={() => setSelectedOrderForDetails(null)} maxWidth="sm" fullWidth>
        {selectedOrderForDetails && (
            <>
                <DialogTitle sx={{ bgcolor: '#0a3d35', color: 'white' }}>Detalle Pedido</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {selectedOrderForDetails.imagenUrl ? (
                            <Box sx={{ width: '100%', height: 200, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                                <img src={selectedOrderForDetails.imagenUrl} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Error+Cargando+Imagen'; }} />
                            </Box>
                        ) : (
                             <Box sx={{ width: '100%', height: 100, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', gap: 1 }}><ImageIcon /> <Typography variant="caption">Sin imagen adjunta</Typography></Box>
                        )}
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>Administrar Estatus</Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select value={selectedOrderForDetails.estado} label="Estado" onChange={handleChangeStatus}>
                                    <MenuItem value="pendiente">Pendiente</MenuItem>
                                    <MenuItem value="asignado" disabled={!selectedOrderForDetails.repartidorAsignado}>Asignado</MenuItem>
                                    <MenuItem value="en_camino" disabled={!selectedOrderForDetails.repartidorAsignado}>En Camino</MenuItem>
                                    <MenuItem value="entregado">Entregado</MenuItem>
                                    <MenuItem value="cancelado">Cancelado</MenuItem>
                                </Select>
                            </FormControl>
                            {!selectedOrderForDetails.repartidorAsignado && <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>* Asigna un repartidor para habilitar opciones de ruta.</Typography>}
                        </Paper>
                        <Typography variant="h6">{selectedOrderForDetails.clienteNombre}</Typography>
                        <Typography>{selectedOrderForDetails.direccionEntrega}</Typography>
                        <Typography variant="body2">{selectedOrderForDetails.descripcion}</Typography>
                        <Divider />
                        <Box display="flex" justifyContent="space-between"><Typography fontWeight="bold">Total:</Typography><Typography fontWeight="bold" color="success.main">${selectedOrderForDetails.precio?.toFixed(2)}</Typography></Box>
                    </Stack>
                </DialogContent>
                <DialogActions><Button onClick={() => setSelectedOrderForDetails(null)}>Cerrar</Button></DialogActions>
            </>
        )}
      </Dialog>

      <OrderForm open={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} onSubmit={handleCreateOrderSubmit} />

      <Snackbar open={!!errorAlert} autoHideDuration={6000} onClose={() => setErrorAlert(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setErrorAlert(null)} severity="error" sx={{ width: '100%' }}>{errorAlert}</Alert>
      </Snackbar>
    </Box>
  );
}