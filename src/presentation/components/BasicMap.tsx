// src/presentation/components/BasicMap.tsx
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Box, Alert, Typography, Chip, Paper } from "@mui/material";

const BasicMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Repartidores de ejemplo
  const deliveries = [
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
      location: { lat: 20.365000, lng: -102.025000 },
    },
    {
      id: '3',
      name: 'Ana L',
      phone: '+57 300 123 4569',
      isActive: false,
      location: { lat: 20.355000, lng: -102.035000 },
    },
  ];

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Error obteniendo ubicación:', error);
          // Usar ubicación por defecto
          setUserLocation({ lat: 20.361244, lng: -102.029551 });
        }
      );
    } else {
      setUserLocation({ lat: 20.361244, lng: -102.029551 });
    }
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!userLocation) return;

      try {
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyArRZ1oMeBMdwpLIB3hssEt_99ceKdzV5s",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          setMap(mapInstance);

          // Agregar marcador de ubicación del usuario
          new google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: 'Tu ubicación',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 3,
            },
          });

          // Agregar marcadores de repartidores
          deliveries.forEach((delivery) => {
            const marker = new google.maps.Marker({
              position: delivery.location,
              map: mapInstance,
              title: `${delivery.name} - ${delivery.isActive ? 'Activo' : 'Inactivo'}`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: delivery.isActive ? "#4caf50" : "#f44336",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              },
            });

            // Agregar info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div>
                  <h3>${delivery.name}</h3>
                  <p>📞 ${delivery.phone}</p>
                  <p>Estado: ${delivery.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });
          });
        }
      } catch (err) {
        console.error("Error cargando Google Maps:", err);
        setError("Error cargando el mapa. Verifica la conexión a internet.");
      }
    };

    initMap();
  }, [userLocation]);

  if (error) {
    return (
      <Alert severity="error" sx={{ height: '400px' }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">
          🗺️ Mapa de Repartidores
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${deliveries.length} total`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${deliveries.filter(d => d.isActive).length} activos`} 
            color="success" 
            size="small" 
          />
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
          <Typography variant="body2">Tu ubicación</Typography>
        </Box>
      </Box>

      {/* Lista de repartidores */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        mb: 2,
        '& > *': {
          flex: '1 1 280px',
          maxWidth: '350px',
        }
      }}>
        {deliveries.map((delivery) => (
          <Paper key={delivery.id} sx={{ p: 2 }}>
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
          </Paper>
        ))}
      </Box>
      
      {/* Mapa */}
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "500px",
          borderRadius: 1,
          overflow: "hidden",
          border: '1px solid #e0e0e0',
        }}
      />

      {/* Info */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Tip:</strong> Haz clic en los marcadores del mapa para ver más información de cada repartidor.
        </Typography>
      </Box>
    </Box>
  );
};

export default BasicMap;