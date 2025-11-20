// src/presentation/components/SimpleLocationMap.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import GoogleMap from './GoogleMap';

interface SimpleLocationMapProps {
  repartidorId: string;
  height?: string;
}

const SimpleLocationMap: React.FC<SimpleLocationMapProps> = ({ 
  repartidorId, 
  height = "400px" 
}) => {
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Token de acceso no encontrado');
          return;
        }
        
        const response = await fetch(`https://api-encargos-ariel.onrender.com/api/ubicaciones/repartidor/${repartidorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            setError('Token expirado. Redirigiendo al login...');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setLocationData(data.data);
        } else {
          setError('No se encontraron datos del repartidor');
        }
      } catch (err: any) {
        setError(`Error al cargar la ubicación: ${err.message}`);
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

  if (error || !locationData) {
    return (
      <Alert severity="error" sx={{ height }}>
        {error || 'No se pudo cargar la ubicación del repartidor'}
      </Alert>
    );
  }

  const markers = [{
    id: locationData.repartidorId._id,
    position: {
      lat: locationData.latitud,
      lng: locationData.longitud,
    },
    title: `${locationData.repartidorId.nombre} - ${locationData.repartidorId.activo ? 'Activo' : 'Inactivo'}`,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${locationData.repartidorId.activo ? '#4caf50' : '#f44336'}" stroke="white" stroke-width="2"/>
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
            <Typography variant="h6">
              🚚 {locationData.repartidorId.nombre}
            </Typography>
          </Box>
          
          <Chip 
            label={locationData.repartidorId.activo ? 'Activo' : 'Inactivo'} 
            color={locationData.repartidorId.activo ? 'success' : 'error'}
            size="small" 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2">
            📞 {locationData.repartidorId.telefono}
          </Typography>
          
          <Typography variant="body2">
            🕒 Última actualización: {formatTimestamp(locationData.timestamp)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            📍 Precisión: {locationData.precision}m
          </Typography>
        </Box>
      </Paper>
      
      {/* Mapa */}
      <GoogleMap
        height={height}
        markers={markers}
        center={{
          lat: locationData.latitud,
          lng: locationData.longitud,
        }}
        zoom={15}
        useCurrentLocation={false}
      />
    </Box>
  );
};

export default SimpleLocationMap;