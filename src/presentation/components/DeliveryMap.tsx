// src/presentation/components/DeliveryMap.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import GoogleMap from './GoogleMap';
import { useDeliveryTracking } from '../../hooks/useSocket';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useOrders } from '../../hooks/useOrders';

const DeliveryMap: React.FC = () => {
  const deliveries = useDeliveryTracking();
  const { deliveries: allDeliveries } = useDeliveries();
  const { orders, assignDelivery } = useOrders();
  
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Combinar datos de deliveries activos con su información completa
  const enrichedDeliveries = deliveries.map(liveDelivery => {
    const deliveryInfo = allDeliveries.find(d => d.id === liveDelivery.deliveryId);
    const assignedOrders = orders.filter(o => o.deliveryId === liveDelivery.deliveryId && 
      ['assigned', 'picked_up', 'in_transit'].includes(o.status));
    
    return {
      ...liveDelivery,
      ...deliveryInfo,
      isOccupied: assignedOrders.length > 0,
      currentOrders: assignedOrders,
    };
  });

  // Convertir deliveries a marcadores para el mapa
  const markers = enrichedDeliveries.map(delivery => ({
    id: delivery.deliveryId,
    position: delivery.location,
    title: `${delivery.name || 'Repartidor'} - ${delivery.isOccupied ? 'Ocupado' : 'Libre'}`,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${delivery.isOccupied ? '#f44336' : '#4caf50'}" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12">🚚</text>
        </svg>
      `),
    },
    onClick: () => handleDeliveryClick(delivery),
  }));

  const handleDeliveryClick = (delivery: any) => {
    setSelectedDelivery(delivery);
    setAssignDialogOpen(true);
  };

  const handleAssignOrder = async () => {
    if (!selectedDelivery || !selectedOrderId) return;

    await assignDelivery({
      orderId: selectedOrderId,
      deliveryId: selectedDelivery.deliveryId,
    });

    setAssignDialogOpen(false);
    setSelectedDelivery(null);
    setSelectedOrderId('');
  };

  const availableOrders = orders.filter(o => o.status === 'pending');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Repartidores en Tiempo Real
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${enrichedDeliveries.length} activos`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${enrichedDeliveries.filter(d => !d.isOccupied).length} libres`} 
            color="success" 
            size="small" 
          />
          <Chip 
            label={`${enrichedDeliveries.filter(d => d.isOccupied).length} ocupados`} 
            color="error" 
            size="small" 
          />
        </Box>
      </Box>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
          <Typography variant="body2">Libre</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
          <Typography variant="body2">Ocupado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
          <Typography variant="body2">Tu ubicación</Typography>
        </Box>
      </Box>
      
      <GoogleMap
        height="500px"
        markers={markers}
        useCurrentLocation={true}
      />
      
      {enrichedDeliveries.length === 0 && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ textAlign: 'center', mt: 2 }}
        >
          No hay repartidores activos en este momento
        </Typography>
      )}

      {/* Dialog para asignar pedidos */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Repartidor: {selectedDelivery?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Estado: {selectedDelivery?.isOccupied ? 'Ocupado' : 'Libre'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vehículo: {selectedDelivery?.vehicleType} {selectedDelivery?.vehiclePlate && `(${selectedDelivery.vehiclePlate})`}
            </Typography>
          </Box>

          {/* Pedidos actuales */}
          {selectedDelivery?.currentOrders?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pedidos Actuales
              </Typography>
              <List dense>
                {selectedDelivery.currentOrders.map((order: any) => (
                  <ListItem key={order.id}>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Pedido #${order.id.slice(-6)}`}
                      secondary={`${order.customerName} - ${order.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Asignar nuevo pedido */}
          {availableOrders.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Asignar Nuevo Pedido
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Pedido</InputLabel>
                <Select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  label="Seleccionar Pedido"
                >
                  {availableOrders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      #{order.id.slice(-6)} - {order.customerName} (${order.totalAmount.toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {availableOrders.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay pedidos pendientes para asignar
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>
            Cerrar
          </Button>
          {availableOrders.length > 0 && (
            <Button
              onClick={handleAssignOrder}
              variant="contained"
              disabled={!selectedOrderId}
            >
              Asignar Pedido
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryMap;