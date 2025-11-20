// src/presentation/components/SingleDeliveryMap.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import GoogleMap from './GoogleMap';
import { locationApi, DeliveryLocation } from '../../api/locationApi';

interface SingleDeliveryMapProps {
  repartidorId: string;
  height?: string;
}

const SingleDeliveryMap: React.FC<SingleDeliveryMapProps> = ({ 
  repartidorId, 
  height = "400px" 
}) => {
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        const locationData = await locationApi.getDeliveryLocation(repartidorId);
        setLocation(locationData);
      } catch (err) {
        setError('Error al cargar la ubicación del repartidor');
        console.error('Error fetching location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();

    // Actualizar cada 15 segundos
    const interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, [repartidorId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !location) {
    return (
      <Alert severity="error" sx={{ height }}>
        {error || 'No se pudo cargar la ubicación del repartidor'}
      </Alert>
    );
  }

  const markers = [{
    id: location.id,
    position: location.location,
    title: `${location.name} - ${location.isActive ? 'Activo' : 'Inactivo'}`,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${location.isActive ? '#4caf50' : '#f44336'}" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12">🚚</text>
        </svg>
      `),
    },
  }];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Box>
      {/* Información del repartidor */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon sx={{ mr: 1, color: location.isActive ? '#4caf50' : '#f44336' }} />
            <Typography variant="h6">
              {location.name}
            </Typography>
          </Box>
          
          <Chip 
            label={location.isActive ? 'Activo' : 'Inactivo'} 
            color={location.isActive ? 'success' : 'error'}
            size="small" 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{location.phone}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="body2">
              Última actualización: {formatTimestamp(location.timestamp)}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Precisión: {location.precision}m
          </Typography>
        </Box>
      </Paper>
      
      {/* Mapa */}
      <GoogleMap
        height={height}
        markers={markers}
        center={location.location}
        zoom={15}
        useCurrentLocation={true}
      />
    </Box>
  );
};

export default SingleDeliveryMap;