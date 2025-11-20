// src/presentation/components/SimpleAllDeliveriesMap.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress,
  Alert,
  Paper,
  Button,
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import GoogleMap from './GoogleMap';

interface SimpleDeliveryLocation {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
  precision: number;
  timestamp: string;
  status: string;
}

const SimpleAllDeliveriesMap: React.FC = () => {
  const [locations, setLocations] = useState<SimpleDeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de acceso no encontrado');
        return;
      }

      console.log('🔍 Obteniendo repartidores...');
      
      // Primero intentar obtener todos los repartidores
      let deliveryIds: string[] = [];
      
      try {
        const deliveriesResponse = await fetch('https://api-encargos-ariel.onrender.com/api/repartidores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          mode: 'cors',
        });
        
        if (deliveriesResponse.ok) {
          const deliveriesData = await deliveriesResponse.json();
          const allDeliveries = deliveriesData.data || deliveriesData || [];
          deliveryIds = allDeliveries
            .filter((d: any) => d.activo)
            .map((d: any) => d._id);
          
          console.log('✅ Repartidores activos encontrados:', deliveryIds.length);
        }
      } catch (error) {
        console.warn('⚠️ No se pudo obtener lista de repartidores, usando fallback');
      }
      
      // Si no se encontraron repartidores, usar IDs conocidos
      if (deliveryIds.length === 0) {
        deliveryIds = [
          '68b1250b5eb8750fe343f177', // David M
          // Agrega más IDs aquí cuando los tengas
        ];
        console.log('📋 Usando IDs conocidos:', deliveryIds.length);
      }

      const locationPromises = deliveryIds.map(async (id) => {
        try {
          const response = await fetch(`https://api-encargos-ariel.onrender.com/api/ubicaciones/repartidor/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            mode: 'cors',
          });
          
          if (!response.ok) {
            console.warn(`⚠️ Error ${response.status} para repartidor ${id}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            return {
              id: data.data.repartidorId._id,
              name: data.data.repartidorId.nombre,
              phone: data.data.repartidorId.telefono,
              isActive: data.data.repartidorId.activo,
              location: {
                lat: data.data.latitud,
                lng: data.data.longitud,
              },
              precision: data.data.precision,
              timestamp: data.data.timestamp,
              status: data.data.estado,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching location for ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(locationPromises);
      const validLocations = results.filter(loc => loc !== null) as SimpleDeliveryLocation[];
      
      setLocations(validLocations);
      
      if (validLocations.length === 0) {
        setError('No se encontraron repartidores activos. Verifica que haya repartidores con ubicación disponible.');
      } else {
        console.log('✅ Ubicaciones válidas obtenidas:', validLocations.length);
      }
    } catch (err: any) {
      setError(`Error al cargar ubicaciones: ${err.message}`);
      console.error('Error fetching all locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLocations();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchAllLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convertir ubicaciones a marcadores
  const markers = locations.map(location => ({
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
    onClick: () => {
      console.log('Clicked on delivery:', location.name);
    },
  }));

  // Calcular centro del mapa basado en las ubicaciones
  const getMapCenter = () => {
    if (locations.length === 0) {
      return { lat: 20.361244, lng: -102.029551 }; // Ubicación de David M por defecto
    }
    
    if (locations.length === 1) {
      return locations[0].location;
    }

    // Calcular centro promedio
    const avgLat = locations.reduce((sum, loc) => sum + loc.location.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.location.lng, 0) / locations.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Todos los Repartidores
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={`${locations.length} total`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${locations.filter(d => d.isActive).length} activos`} 
            color="success" 
            size="small" 
          />
          <Chip 
            label={`${locations.filter(d => !d.isActive).length} inactivos`} 
            color="error" 
            size="small" 
          />
          <Button
            variant="outlined"
            size="small"
            onClick={fetchAllLocations}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      {/* Leyenda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
          <Typography variant="body2">Activo</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
          <Typography variant="body2">Inactivo</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista de repartidores */}
      {locations.length > 0 && (
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
          {locations.map((location) => (
            <Paper key={location.id} sx={{ p: 2, height: 'fit-content' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🚚 {location.name}
                </Typography>
                <Chip
                  label={location.isActive ? 'Activo' : 'Inactivo'}
                  color={location.isActive ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                📞 {location.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🕒 {formatTimestamp(location.timestamp)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 Precisión: {location.precision}m
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
      
      {/* Mapa */}
      <GoogleMap
        height="500px"
        markers={markers}
        center={getMapCenter()}
        zoom={locations.length === 1 ? 15 : 12}
        useCurrentLocation={false}
      />
      
      {locations.length === 0 && !loading && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ textAlign: 'center', mt: 2 }}
        >
          No hay repartidores disponibles en este momento
        </Typography>
      )}
    </Box>
  );
};

export default SimpleAllDeliveriesMap;