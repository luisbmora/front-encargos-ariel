// src/presentation/components/GoogleMap.tsx
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Box, Alert } from "@mui/material";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    icon?: any;
    onClick?: () => void;
  }>;
  onMapClick?: (event: any) => void;
  useCurrentLocation?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: -34.6037, lng: -58.3816 }, // Buenos Aires por defecto
  zoom = 13,
  height = "400px",
  markers = [],
  onMapClick,
  useCurrentLocation = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const markersRef = useRef<any[]>([]);
  const [googleMaps, setGoogleMaps] = useState<any>(null);

  // Obtener ubicación actual
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
        },
        (error) => {
          console.warn("Error obteniendo ubicación:", error);
          // Mostrar mensaje más específico según el tipo de error
          if (error.code === 1) {
            console.log("ℹ️ Usuario negó el acceso a la ubicación");
          } else if (error.code === 2) {
            console.log("ℹ️ Ubicación no disponible");
          } else if (error.code === 3) {
            console.log("ℹ️ Timeout obteniendo ubicación");
          }
          setCurrentLocation(center);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutos
        }
      );
    } else {
      setCurrentLocation(center);
    }
  }, [useCurrentLocation, center]);

  useEffect(() => {
    const initMap = async () => {
      if (!currentLocation) return;

      try {
        const loader = new Loader({
          apiKey:
            process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
            "AIzaSyArRZ1oMeBMdwpLIB3hssEt_99ceKdzV5s",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();
        setGoogleMaps(google.maps);

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: currentLocation,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          setMap(mapInstance);

          // Agregar marcador de ubicación actual
          if (useCurrentLocation) {
            new google.maps.Marker({
              position: currentLocation,
              map: mapInstance,
              title: "Tu ubicación",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              },
            });
          }

          // Agregar listener para clicks en el mapa
          if (onMapClick) {
            mapInstance.addListener("click", onMapClick);
          }
        }
      } catch (err) {
        console.error("Error cargando Google Maps:", err);
        setError("Error cargando el mapa. Verifica tu API key de Google Maps.");
      }
    };

    initMap();
  }, [currentLocation, zoom, onMapClick, useCurrentLocation]);

  // Actualizar marcadores cuando cambien
  useEffect(() => {
    if (!map || !googleMaps) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Agregar nuevos marcadores
    markers.forEach((markerData) => {
      const marker = new googleMaps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: markerData.icon,
      });

      // Agregar click listener si existe
      if (markerData.onClick) {
        marker.addListener("click", markerData.onClick);
      }

      markersRef.current.push(marker);
    });
  }, [map, markers, googleMaps]);

  if (error) {
    return (
      <Alert severity="error" sx={{ height }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      ref={mapRef}
      sx={{
        width: "100%",
        height,
        borderRadius: 1,
        overflow: "hidden",
      }}
    />
  );
};

export default GoogleMap;
