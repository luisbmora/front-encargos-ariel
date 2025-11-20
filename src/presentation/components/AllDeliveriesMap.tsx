// src/presentation/components/AllDeliveriesMap.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { LocalShipping as LocalShippingIcon } from "@mui/icons-material";
import GoogleMap from "./GoogleMap";
import { locationApi } from "../../api/locationApi";

interface DeliveryLocation {
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

const AllDeliveriesMap: React.FC = () => {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar obtener todas las ubicaciones
      const allLocations = await locationApi.getAllLocationsWithFallback();
      setLocations(allLocations);

      if (allLocations.length === 0) {
        setError("No se encontraron repartidores activos");
      }
    } catch (err: any) {
      setError(`Error al cargar ubicaciones: ${err.message}`);
      console.error("Error fetching all locations:", err);
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
  const markers = locations.map((location) => ({
    id: location.id,
    position: location.location,
    title: `${location.name} - ${location.isActive ? "Activo" : "Inactivo"}`,
    icon: {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${
            location.isActive ? "#4caf50" : "#f44336"
          }" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12">🚚</text>
        </svg>
      `),
    },
    onClick: () => {
      console.log("Clicked on delivery:", location.name);
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
    const avgLat =
      locations.reduce((sum, loc) => sum + loc.location.lat, 0) /
      locations.length;
    const avgLng =
      locations.reduce((sum, loc) => sum + loc.location.lng, 0) /
      locations.length;

    return { lat: avgLat, lng: avgLng };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Todos los Repartidores</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`${locations.length} total`}
            color="primary"
            size="small"
          />
          <Chip
            label={`${locations.filter((d) => d.isActive).length} activos`}
            color="success"
            size="small"
          />
          <Chip
            label={`${locations.filter((d) => !d.isActive).length} inactivos`}
            color="error"
            size="small"
          />
        </Box>
      </Box>

      {/* Leyenda */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "#4caf50",
            }}
          />
          <Typography variant="body2">Activo</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "#f44336",
            }}
          />
          <Typography variant="body2">Inactivo</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "#2196f3",
            }}
          />
          <Typography variant="body2">Tu ubicación</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista de repartidores */}
      {locations.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
            "& > *": {
              flex: "1 1 300px",
              minWidth: "280px",
              maxWidth: "400px",
            },
          }}
        >
          {locations.map((location) => (
            <Paper key={location.id} sx={{ p: 2, height: "fit-content" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🚚 {location.name}
                </Typography>
                <Chip
                  label={location.isActive ? "Activo" : "Inactivo"}
                  color={location.isActive ? "success" : "error"}
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
        useCurrentLocation={false} // Desactivar geolocalización para evitar el error
      />

      {locations.length === 0 && !loading && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 2 }}
        >
          No hay repartidores disponibles en este momento
        </Typography>
      )}
    </Box>
  );
};

export default AllDeliveriesMap;
