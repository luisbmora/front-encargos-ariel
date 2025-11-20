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
          {orders
            .slice() // copiar array para evitar mutación
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // ordenar por fecha descendente
            .slice(0, 5) // mostrar solo los últimos 5
            .map((order) => (
            <ListItem key={order._id} divider>
              <ListItemAvatar>
                <Avatar>
                  <AssignmentIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Pedido #${order._id}`}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {order.clienteNombre || 'Sin nombre'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dirección: {order.direccionEntrega || 'Sin dirección'}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={getStatusText(order.estado)}
                color={getStatusColor(order.estado) as any}
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
