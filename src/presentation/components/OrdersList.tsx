// src/presentation/components/OrdersList.tsx
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useOrderUpdates } from '../../hooks/useSocket';

const OrdersList: React.FC = () => {
  const orders = useOrderUpdates();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Últimos Pedidos ({orders.length})
      </Typography>
      
      {orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay pedidos recientes
        </Typography>
      ) : (
        <List>
          {orders.slice(0, 5).map((order) => (
            <ListItem key={order.id} divider>
              <ListItemAvatar>
                <Avatar>
                  <AssignmentIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Pedido #${order.id}`}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {order.customerName || 'Sin nombre'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dirección: {order.address || 'Sin dirección'}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={getStatusText(order.status)}
                color={getStatusColor(order.status) as any}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrdersList;