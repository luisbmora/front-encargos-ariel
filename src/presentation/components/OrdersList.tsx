import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Stack,
  useTheme,
  alpha
} from '@mui/material';

// Íconos minimalistas
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { useOrderUpdates, useNotificationMonitor } from '../../hooks/useSocket';

// COLORES SEMÁNTICOS MODERNOS (Estilo Stripe/Airbnb)
const getStatusStyles = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return { bg: '#FFF4E6', color: '#E67700', label: 'Pendiente', dotColor: '#FF9500' };
    case 'asignado':
      return { bg: '#E3F2FD', color: '#1565C0', label: 'Asignado', dotColor: '#2196F3' };
    case 'en_camino':
      return { bg: '#F3E5F5', color: '#6A1B9A', label: 'En Camino', dotColor: '#9C27B0' };
    case 'entregado':
      return { bg: '#E8F5E9', color: '#2E7D32', label: 'Entregado', dotColor: '#4CAF50' };
    case 'cancelado':
      return { bg: '#FFEBEE', color: '#C62828', label: 'Cancelado', dotColor: '#F44336' };
    default:
      return { bg: '#F5F5F5', color: '#616161', label: estado, dotColor: '#9E9E9E' };
  }
};

const OrdersList: React.FC = () => {
  const theme = useTheme();
  const rawOrders = useOrderUpdates();
  const orders = useNotificationMonitor(rawOrders);

  // Ordenar por fecha
  const displayOrders = orders
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, margin: '0 auto', p: 3 }}>
      
      {/* Título minimalista */}
      <Typography 
        variant="h5" 
        fontWeight="600" 
        mb={3} 
        sx={{ 
          color: '#0F172A',
          letterSpacing: '-0.02em'
        }}
      >
        Pedidos Recientes
      </Typography>

      <Stack spacing={1.5}>
        {displayOrders.map((order) => {
          const status = getStatusStyles(order.estado);

          return (
            <Box
              key={order._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                  boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {/* Avatar - Izquierda */}
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  flexShrink: 0
                }}
              >
                <PersonIcon sx={{ fontSize: 22 }} />
              </Avatar>

              {/* Información del Cliente - Centro (Flex Grow) */}
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {/* Status Chip - Superior Izquierda */}
                <Chip
                  icon={
                    <FiberManualRecordIcon 
                      sx={{ 
                        fontSize: 8,
                        color: `${status.dotColor} !important`
                      }} 
                    />
                  }
                  label={status.label}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: 1.5,
                    backgroundColor: status.bg,
                    color: status.color,
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.02em',
                    border: 'none',
                    alignSelf: 'flex-start',
                    mb: 0.5,
                    '& .MuiChip-icon': {
                      marginLeft: '8px',
                      marginRight: '-4px'
                    },
                    '& .MuiChip-label': {
                      paddingLeft: '6px',
                      paddingRight: '10px'
                    }
                  }}
                />

                {/* Nombre del Cliente */}
                <Typography 
                  variant="body1" 
                  fontWeight="600" 
                  noWrap 
                  sx={{ 
                    color: '#0F172A',
                    fontSize: '0.9375rem',
                    lineHeight: 1.4
                  }}
                >
                  {order.clienteNombre || 'Cliente'}
                </Typography>

                {/* Dirección con icono */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 14, color: '#94A3B8', flexShrink: 0 }} />
                  <Typography 
                    variant="body2" 
                    noWrap 
                    sx={{ 
                      color: '#64748B',
                      fontSize: '0.8125rem',
                      fontWeight: 500
                    }}
                  >
                    {order.direccionEntrega || 'Sin dirección'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Estado vacío elegante */}
      {displayOrders.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#94A3B8'
          }}
        >
          <Typography variant="body2" fontWeight="500">
            No hay pedidos recientes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrdersList;