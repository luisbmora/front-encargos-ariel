// src/presentation/components/WorkingMap.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper,
  Alert,
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import GoogleMap from './GoogleMap';

interface MockDelivery {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

const WorkingMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Repartidores de ejemplo (puedes cambiar estas ubicaciones)
  const mockDeliveries: MockDelivery[] = [
    {
      id: '1',
      name: 'David M',
      phone: '+57 300 123 4567',
      isActive: true,
      location: { lat: 20.361244, lng: -102.029551 }, // México
    },
    {
      id: '2',
      name: 'Carlos R',
      phone: '+57 300 123 4568',
      isActive: true,
      location: { lat: 20.365000, lng: -102.025000 }, // Cerca de David
    },
    {
      id: '3',
      name: 'Ana L',
      phone: '+57 300 123 4569',
      isActive: false,
      location: { lat: 20.355000, lng: -102.035000 }, // Otra ubicación
    },
  ];

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          console.log('✅ Ubicación del usuario obtenida:', location);
        },
        (error) => {
          console.warn('⚠️ Error obteniendo ubicación del usuario:', error);
          setLocationError('No se pudo obtener tu ubicación. Se usará ubicación por defecto.');
          // Usar ubicación por defecto (México)
          setUserLocation({ lat: 20.361244, lng: -102.029551 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      setLocationError('Geolocalización no disponible en este navegador.');
      setUserLocation({ lat: 20.361244, lng: -102.029551 });
    }
  }, []);

  // Crear marcadores para el mapa
  const markers = mockDeliveries.map(delivery => ({
    id: delivery.id,
    position: delivery.location,
    title: `${delivery.name} - ${delivery.isActive ? 'Activo' : 'Inactivo'}`,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${delivery.isActive ? '#4caf50' : '#f44336'}" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12">🚚</text>
        </svg>
      `),
    },
    onClick: () => {
      console.log('Clicked on delivery:', delivery.name);
    },
  }));

  // Calcular centro del mapa
  const getMapCenter = () => {
    if (userLocation) {
      return userLocation;
    }
    // Si no hay ubicación del usuario, usar la primera ubicación de repartidor
    return mockDeliveries[0].location;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Mapa de Repartidores
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={`${mockDeliveries.length} total`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${mockDeliveries.filter(d => d.isActive).length} activos`} 
            color="success" 
            size="small" 
          />
          <Chip 
            label={`${mockDeliveries.filter(d => !d.isActive).length} inactivos`} 
            color="error" 
            size="small" 
          />
        </Box>
      </Box>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
          <Typography variant="body2">Repartidor Activo</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
          <Typography variant="body2">Repartidor Inactivo</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
          <Typography variant="body2">Tu Ubicación</Typography>
        </Box>
      </Box>

      {locationError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}

      {/* Lista de repartidores */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 2,
        '& > *': {
          flex: '1 1 300px',
          minWidth: '280px',
          maxWidth: '400px',
        }
      }}>
        {mockDeliveries.map((delivery) => (
          <Paper key={delivery.id} sx={{ p: 2, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                🚚 {delivery.name}
              </Typography>
              <Chip
                label={delivery.isActive ? 'Activo' : 'Inactivo'}
                color={delivery.isActive ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              📞 {delivery.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📍 Lat: {delivery.location.lat.toFixed(6)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📍 Lng: {delivery.location.lng.toFixed(6)}
            </Typography>
          </Paper>
        ))}
      </Box>
      
      {/* Mapa */}
      <GoogleMap
        height="500px"
        markers={markers}
        center={getMapCenter()}
        zoom={14}
        useCurrentLocation={true} // Habilitar geolocalización
      />
      
      {/* Información adicional */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Este mapa muestra repartidores de ejemplo. 
          {userLocation ? 
            ` Tu ubicación actual: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` :
            ' Permitir acceso a la ubicación para ver tu posición en el mapa.'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default WorkingMap;