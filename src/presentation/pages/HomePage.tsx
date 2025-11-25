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
  Stack
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
import AddIcon from '@mui/icons-material/Add'; // Nuevo icono para agregar

// Import Hooks
import { useOrders } from "../../hooks/useOrders";
import { useDeliveries } from "../../hooks/useDeliveries";
import { useAllActiveLocations } from "../../hooks/useRealTimeLocations";

// Import Types
import { Order } from "../../types/order";
import { Delivery } from "../../types/delivery";
import { DeliveryLocation } from "../../api/locationApi";

// Import Components
import BasicMap from "../components/BasicMap";
import OrderForm from "../components/OrderForm"; // <--- IMPORTANTE: Tu componente de formulario

export default function HomePage() {
  // Asegúrate de que tu hook useOrders exporte createOrder
  const { orders, assignDelivery, createOrder } = useOrders(); 
  const { deliveries } = useDeliveries();
  const { locations: realTimeLocations, loading } = useAllActiveLocations(5000);

  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  
  // Modales existentes
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<any>(null);
  const [orderToAssign, setOrderToAssign] = useState<any>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
  
  // NUEVO ESTADO: Controlar el modal de crear orden
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // Asignación
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // 1. LÓGICA DE FUSIÓN DE REPARTIDORES
  const mappedDeliveries = useMemo(() => {
    if (deliveries.length === 0 && realTimeLocations.length > 0) {
        return realTimeLocations.map((loc: DeliveryLocation) => ({
            id: loc.id,
            name: loc.name || 'Repartidor Desconocido',
            location: { 
                lat: loc.location?.lat || 0, 
                lng: loc.location?.lng || 0 
            },
            isActive: loc.isActive,
            phone: loc.phone || '',
            vehicleType: 'motorcycle'
        }));
    }

    return deliveries.map((dbDelivery: Delivery) => {
      const realLoc = realTimeLocations.find(loc => loc.id === dbDelivery._id);
      const defaultLocation = { lat: 20.659698, lng: -103.349609 }; 
      const finalLocation = realLoc && realLoc.location
        ? { lat: realLoc.location.lat, lng: realLoc.location.lng }
        : defaultLocation;

      return {
        id: dbDelivery._id,
        name: dbDelivery.nombre,
        location: finalLocation,
        isActive: realLoc ? true : dbDelivery.activo,
        phone: dbDelivery.telefono,
        vehicleType: 'motorcycle', 
        avatarUrl: '' 
      };
    });
  }, [deliveries, realTimeLocations]);

  // 2. LÓGICA DE ORDENES
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

  // 3. FILTRADO LISTA LATERAL
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

  const getDriverOrders = (driverId: string) => {
    return orders.filter(o => {
        const assignedId = typeof o.repartidorAsignado === 'object' && o.repartidorAsignado !== null
            ? (o.repartidorAsignado as any)._id 
            : o.repartidorAsignado;
        const isSameDriver = String(assignedId) === String(driverId);
        const isActiveStatus = ['asignado', 'en_camino'].includes(o.estado);
        return isSameDriver && isActiveStatus;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSearchTerm("");
  };

  const handleAssignConfirm = async () => {
      if (!orderToAssign || !selectedDriverId) return;
      try {
          setIsAssigning(true);
          await assignDelivery(orderToAssign.id, selectedDriverId);
          setOrderToAssign(null);
          setSelectedDriverId('');
          setTabIndex(0);
      } catch (error) {
          console.error("Error al asignar", error);
      } finally {
          setIsAssigning(false);
      }
  };

  // NUEVO: Manejar creación de orden desde el OrderForm
  const handleCreateOrderSubmit = async (data: any) => {
    try {
        const success = await createOrder(data);
        if (success) {
            setIsCreateOrderOpen(false);
            // Opcional: Mostrar notificación de éxito
        }
        return success;
    } catch (error) {
        console.error("Error creando orden:", error);
        return false;
    }
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      
      {/* MAPA DE FONDO */}
      <BasicMap 
        deliveries={mappedDeliveries} 
        orders={mappedOrders} 
      />

      {/* PANEL FLOTANTE */}
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
          {/* Header */}
          <Box sx={{ bgcolor: '#0a3d35', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">LOGIMAP</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%' }} />
                <Typography variant="caption">Panel de Control</Typography>
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setPanelOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="REPARTIDORES" />
            <Tab icon={<InventoryIcon />} iconPosition="start" label="ORDENES" />
          </Tabs>

          {/* Search */}
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={tabIndex === 0 ? "Buscar repartidor..." : "Buscar orden #..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              RESULTADOS: {filteredList.length}
            </Typography>
          </Box>

          {/* NUEVO: Botón "Nueva Orden" solo en la pestaña de Órdenes */}
          {tabIndex === 1 && (
            <Box sx={{ px: 2, pb: 1 }}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary" // Color diferente para destacar
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateOrderOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Nueva Orden
                </Button>
            </Box>
          )}

          {/* List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1, bgcolor: '#f8f9fa' }}>
            
            {loading && tabIndex === 0 && (
                 <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20}/></Box>
            )}

            <List>
              {filteredList.map((item: any) => {
                const driverOrders = tabIndex === 0 ? getDriverOrders(item.id) : [];
                const driverActiveOrdersCount = driverOrders.length;

                return (
                <Paper key={item.id} elevation={0} variant="outlined" sx={{ mb: 1, borderRadius: 2, bgcolor: 'white', overflow: 'hidden' }}>
                  
                  {tabIndex === 0 ? (
                    // --- CARD REPARTIDOR ---
                    <>
                      <ListItemButton alignItems="flex-start" onClick={() => setSelectedDriverForModal(item)}>
                        <ListItemAvatar>
                          <Box position="relative">
                            <Badge badgeContent={driverActiveOrdersCount} color="error" overlap="circular">
                                <Avatar sx={{ bgcolor: theme => theme.palette.primary.main }}>
                                    {item.name ? item.name.charAt(0).toUpperCase() : "R"}
                                </Avatar>
                            </Badge>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                border: '2px solid white',
                                bgcolor: item.isActive ? '#4caf50' : '#bdbdbd'
                              }}
                            />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold">{item.name}</Typography>
                          }
                          secondary={
                            <Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    {item.vehicleType === 'car' ? <DirectionsCarIcon fontSize="inherit"/> : <TwoWheelerIcon fontSize="inherit"/>}
                                    <Typography variant="caption">{item.vehicleType === 'car' ? 'Auto' : 'Moto'}</Typography>
                                </Box>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {item.phone || 'Sin teléfono'}
                                </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                      <Divider />
                      <Box sx={{ display: 'flex', p: 1, gap: 1 }}>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small" 
                            color={driverActiveOrdersCount > 0 ? "primary" : "inherit"}
                            startIcon={<ReceiptLongIcon />}
                            onClick={() => setSelectedDriverForModal(item)}
                        >
                            {driverActiveOrdersCount > 0 
                                ? `Ver ${driverActiveOrdersCount} Pedidos` 
                                : "Sin Pedidos Activos"}
                        </Button>
                      </Box>
                    </>
                  ) : (
                    // --- CARD ORDEN (LISTA PRINCIPAL) ---
                    <>
                       <ListItemButton alignItems="flex-start" onClick={() => setSelectedOrderForDetails(item)}>
                         <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Chip 
                                    label={`#${item.id.substring(item.id.length - 6).toUpperCase()}`} 
                                    size="small" 
                                    color="default" 
                                    variant="outlined" 
                                />
                                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                    ${item.total ? item.total.toFixed(2) : '0.00'}
                                </Typography>
                            </Box>
                            
                            <Typography variant="body2" fontWeight="bold" gutterBottom>{item.title}</Typography>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                📍 {item.address || 'Sin dirección'}
                            </Typography>
                            
                            {item.state === 'pendiente' ? (
                                <Button 
                                    fullWidth 
                                    variant="contained"
                                    color="warning" 
                                    size="small"
                                    startIcon={<PersonAddIcon />}
                                    sx={{ boxShadow: 'none', mt: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setOrderToAssign(item)
                                    }}
                                >
                                    ASIGNAR REPARTIDOR
                                </Button>
                            ) : (
                                <Button 
                                    fullWidth 
                                    variant={item.state === 'en_camino' ? "outlined" : "contained"}
                                    color="primary"
                                    size="small"
                                    sx={{ boxShadow: 'none', mt: 1 }}
                                    disabled 
                                >
                                    {item.state === 'en_camino' ? 'EN RUTA' : item.state.toUpperCase()}
                                </Button>
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
        <Button
            variant="contained"
            color="primary"
            onClick={() => setPanelOpen(true)}
            sx={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}
        >
            Abrir Panel
        </Button>
      )}

      {/* --- MODAL 1: VER PEDIDOS DEL REPARTIDOR --- */}
      <Dialog 
        open={!!selectedDriverForModal} 
        onClose={() => setSelectedDriverForModal(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#0a3d35', color: 'white' }}>
            {selectedDriverForModal?.name}
            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                Lista de encargos asignados
            </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            {selectedDriverForModal && getDriverOrders(selectedDriverForModal.id).length > 0 ? (
                <List disablePadding>
                    {getDriverOrders(selectedDriverForModal.id).map((order) => (
                        <Paper 
                            key={order._id} 
                            variant="outlined" 
                            sx={{ 
                                mb: 2, 
                                p: 2, 
                                borderColor: order.estado === 'en_camino' ? 'primary.main' : 'divider',
                                cursor: 'pointer',
                                transition: '0.2s',
                                '&:hover': {
                                    bgcolor: 'white',
                                    boxShadow: 2
                                }
                            }}
                            onClick={() => setSelectedOrderForDetails(order)} 
                        >
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Chip 
                                    label={`#${order._id.substring(order._id.length - 6).toUpperCase()}`} 
                                    size="small" 
                                    color="primary" 
                                />
                                <Chip 
                                    label={order.estado === 'en_camino' ? 'En Ruta' : 'Asignado'} 
                                    size="small" 
                                    color={order.estado === 'en_camino' ? 'success' : 'warning'} 
                                    variant="outlined"
                                />
                            </Box>
                             <Typography variant="h6" fontSize="1rem" gutterBottom>{order.clienteNombre}</Typography>
                             <Typography variant="body2" color="text.secondary" gutterBottom>📍 {order.direccionEntrega}</Typography>
                             
                             <Box display="flex" justifyContent="flex-end" mt={1}>
                                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                    Total: ${order.precio.toFixed(2)}
                                </Typography>
                             </Box>
                             <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={1}>
                                Click para ver más detalles
                             </Typography>
                        </Paper>
                    ))}
                </List>
            ) : (
                <Box textAlign="center" py={4}>
                    <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                        Este repartidor no tiene pedidos activos.
                    </Typography>
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setSelectedDriverForModal(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: ASIGNAR --- */}
      <Dialog
        open={!!orderToAssign}
        onClose={() => setOrderToAssign(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: theme => theme.palette.warning.main, color: '#fff' }}>
            Asignar Encargo
        </DialogTitle>
        <DialogContent dividers>
            {mappedDeliveries.filter(d => d.isActive).length === 0 ? (
                <Alert severity="warning">No hay repartidores activos.</Alert>
            ) : (
                <RadioGroup
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                >
                    <List disablePadding>
                        {mappedDeliveries
                            .filter(d => d.isActive)
                            .map((driver) => {
                                const currentLoad = getDriverOrders(driver.id).length;
                                return (
                                    <ListItemButton 
                                        key={driver.id} 
                                        onClick={() => setSelectedDriverId(driver.id)}
                                        selected={selectedDriverId === driver.id}
                                        sx={{ borderRadius: 1, mb: 0.5, border: '1px solid #eee' }}
                                    >
                                        <FormControlLabel
                                            value={driver.id}
                                            control={<Radio />}
                                            label=""
                                            sx={{ mr: 1, mb: 0 }}
                                        />
                                        <ListItemAvatar>
                                            <Badge badgeContent={currentLoad} color={currentLoad > 0 ? "warning" : "success"}>
                                                <Avatar>{driver.name.charAt(0)}</Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={driver.name}
                                            secondary={`${currentLoad} pedidos en curso`}
                                        />
                                    </ListItemButton>
                                );
                            })}
                    </List>
                </RadioGroup>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOrderToAssign(null)} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleAssignConfirm} 
                variant="contained" 
                color="primary"
                disabled={!selectedDriverId || isAssigning}
            >
                {isAssigning ? 'Asignando...' : 'Confirmar'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 3: DETALLE COMPLETO DEL PEDIDO --- */}
      <Dialog
        open={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedOrderForDetails && (
            <>
                <DialogTitle sx={{ bgcolor: '#0a3d35', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        Pedido #{selectedOrderForDetails._id?.substring(selectedOrderForDetails._id.length - 6).toUpperCase()}
                        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                             {formatDate(selectedOrderForDetails.fechaCreacion)}
                        </Typography>
                    </Box>
                    <Chip 
                        label={selectedOrderForDetails.estado.toUpperCase()} 
                        color={selectedOrderForDetails.estado === 'en_camino' ? 'success' : 'warning'}
                        sx={{ bgcolor: 'white', color: '#0a3d35', fontWeight: 'bold' }}
                    />
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box>
                             <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <PersonIcon color="primary" />
                                <Typography variant="h6" fontWeight="bold">Cliente</Typography>
                             </Box>
                             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{selectedOrderForDetails.clienteNombre}</Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{selectedOrderForDetails.clienteTelefono}</Typography>
                                </Box>
                             </Paper>
                        </Box>
                        <Box>
                             <Box display="flex" alignItems="center" gap={1} mb={1} mt={1}>
                                <LocationOnIcon color="error" />
                                <Typography variant="h6" fontWeight="bold">Dirección de Entrega</Typography>
                             </Box>
                             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff4f4' }}>
                                <Typography variant="body1">{selectedOrderForDetails.direccionEntrega}</Typography>
                                {selectedOrderForDetails.direccionRecogida && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption" color="text.secondary">Recogida:</Typography>
                                        <Typography variant="body2">{selectedOrderForDetails.direccionRecogida}</Typography>
                                    </>
                                )}
                             </Paper>
                        </Box>
                        <Box>
                             <Box display="flex" alignItems="center" gap={1} mb={1} mt={1}>
                                <NotesIcon color="info" />
                                <Typography variant="h6" fontWeight="bold">Detalles del Encargo</Typography>
                             </Box>
                             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="body2" paragraph>
                                    {selectedOrderForDetails.descripcion || "Sin descripción adicional."}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <MonetizationOnIcon color="success" />
                                        <Typography variant="h6">Total a cobrar:</Typography>
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        ${selectedOrderForDetails.precio?.toFixed(2)}
                                    </Typography>
                                </Box>
                             </Paper>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedOrderForDetails(null)} variant="outlined">
                        Cerrar
                    </Button>
                    <Button variant="contained" color="primary">
                        Contactar Cliente
                    </Button>
                </DialogActions>
            </>
        )}
      </Dialog>

      {/* --- MODAL 4: CREAR NUEVA ORDEN --- */}
      <OrderForm
        open={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmit={handleCreateOrderSubmit}
      />

    </Box>
  );
}