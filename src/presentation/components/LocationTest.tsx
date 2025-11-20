// src/presentation/components/LocationTest.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { locationApi } from '../../api/locationApi';

const LocationTest: React.FC = () => {
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de acceso no encontrado');
        return;
      }
      
      // Probar la API directamente
      const response = await fetch('https://api-encargos-ariel.onrender.com/api/ubicaciones/repartidor/68b1250b5eb8750fe343f177', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const rawData = await response.json();
      
      console.log('Raw API Response:', rawData);
      
      // Probar nuestro servicio con axios
      const processedDataAxios = await locationApi.getDeliveryLocation('68b1250b5eb8750fe343f177');
      
      // Probar nuestro servicio con fetch
      const processedDataFetch = await locationApi.getDeliveryLocationWithFetch('68b1250b5eb8750fe343f177');
      
      setLocationData({
        raw: rawData,
        processedAxios: processedDataAxios,
        processedFetch: processedDataFetch,
        token: token ? 'Token presente' : 'Token no encontrado',
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testLocation();
  }, []);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Test de API de Ubicaciones
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testLocation} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Probar API'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {locationData && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Datos Raw de la API:
          </Typography>
          <Box component="pre" sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            overflow: 'auto',
            fontSize: '0.8rem',
            mb: 2,
          }}>
            {JSON.stringify(locationData.raw, null, 2)}
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Datos Procesados:
          </Typography>
          <Box component="pre" sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            overflow: 'auto',
            fontSize: '0.8rem',
          }}>
            {JSON.stringify(locationData.processed, null, 2)}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LocationTest;