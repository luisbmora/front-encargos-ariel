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

  // Obtener ubicación actual del usuario
  useEffect(() => {
    console.log("🗺️ GoogleMap: Iniciando componente...");
    console.log("🗺️ GoogleMap: useCurrentLocation =", useCurrentLocation);
    console.log("🗺️ GoogleMap: navigator.geolocation =", !!navigator.geolocation);
    
    if (useCurrentLocation && navigator.geolocation) {
      console.log("🌍 GoogleMap: Solicitando ubicación actual del usuario...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("✅ GoogleMap: Ubicación obtenida exitosamente!");
          console.log("📍 GoogleMap: Latitud:", location.lat);
          console.log("📍 GoogleMap: Longitud:", location.lng);
          console.log("📍 GoogleMap: Precisión:", position.coords.accuracy, "metros");
          setCurrentLocation(location);
        },
        (error) => {
          console.error("❌ GoogleMap: Error obteniendo ubicación:", error);
          console.error("❌ GoogleMap: Código de error:", error.code);
          console.error("❌ GoogleMap: Mensaje:", error.message);
          
          // Mostrar mensaje más específico según el tipo de error
          if (error.code === 1) {
            console.log("🚫 GoogleMap: Usuario negó el acceso a la ubicación");
            setError("Permiso de ubicación denegado. Usando ubicación por defecto.");
          } else if (error.code === 2) {
            console.log("📡 GoogleMap: Ubicación no disponible");
            setError("Ubicación no disponible. Usando ubicación por defecto.");
          } else if (error.code === 3) {
            console.log("⏱️ GoogleMap: Timeout obteniendo ubicación");
            setError("Timeout obteniendo ubicación. Usando ubicación por defecto.");
          }
          
          console.log("🔄 GoogleMap: Usando ubicación por defecto:", center);
          // Usar ubicación por defecto solo si falla
          setCurrentLocation(center);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Aumentado a 15 segundos
          maximumAge: 0, // Siempre obtener ubicación fresca
        }
      );
    } else {
      if (!navigator.geolocation) {
        console.log("⚠️ GoogleMap: Geolocalización no soportada por el navegador");
        setError("Tu navegador no soporta geolocalización");
      } else {
        console.log("ℹ️ GoogleMap: useCurrentLocation está desactivado");
      }
      console.log("🔄 GoogleMap: Usando ubicación del prop center:", center);
      setCurrentLocation(center);
    }
  }, [useCurrentLocation, center]);

  useEffect(() => {
    const initMap = async () => {
      if (!currentLocation) {
        console.log("⏳ GoogleMap: Esperando ubicación...");
        return;
      }

      console.log("🗺️ GoogleMap: Inicializando mapa con ubicación:", currentLocation);

      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          console.error("❌ GoogleMap: API Key no configurada");
          setError("API Key de Google Maps no configurada");
          return;
        }

        console.log("🔑 GoogleMap: API Key encontrada");
        console.log("📦 GoogleMap: Cargando Google Maps...");

        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "marker"],
        });

        const google = await loader.load();
        console.log("✅ GoogleMap: Google Maps cargado exitosamente");
        setGoogleMaps(google.maps);

        if (mapRef.current) {
          console.log("🗺️ GoogleMap: Creando instancia del mapa...");
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: currentLocation,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapId: "DEMO_MAP_ID", // Requerido para AdvancedMarkerElement
          });

          console.log("✅ GoogleMap: Mapa creado exitosamente");
          console.log("📍 GoogleMap: Centro del mapa:", currentLocation);
          console.log("🔍 GoogleMap: Zoom:", zoom);
          setMap(mapInstance);

          // Agregar marcador de ubicación actual usando la nueva API
          if (useCurrentLocation) {
            console.log("📍 GoogleMap: Agregando marcador de ubicación actual...");
            // Fallback a Marker antiguo si AdvancedMarkerElement no está disponible
            if (google.maps.marker?.AdvancedMarkerElement) {
              console.log("✨ GoogleMap: Usando AdvancedMarkerElement (nueva API)");
              const markerContent = document.createElement("div");
              markerContent.style.width = "16px";
              markerContent.style.height = "16px";
              markerContent.style.borderRadius = "50%";
              markerContent.style.backgroundColor = "#4285F4";
              markerContent.style.border = "2px solid white";
              markerContent.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

              new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: currentLocation,
                content: markerContent,
                title: "Tu ubicación",
              });
              console.log("✅ GoogleMap: Marcador agregado con AdvancedMarkerElement");
            } else {
              console.log("⚠️ GoogleMap: Usando Marker antiguo (fallback)");
              // Fallback para navegadores que no soportan la nueva API
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
              console.log("✅ GoogleMap: Marcador agregado con Marker antiguo");
            }
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
      // Usar AdvancedMarkerElement si está disponible, sino usar Marker antiguo
      if (googleMaps.marker?.AdvancedMarkerElement && markerData.icon) {
        const markerContent = document.createElement("div");
        markerContent.innerHTML = markerData.icon || "📍";
        
        const marker = new googleMaps.marker.AdvancedMarkerElement({
          map,
          position: markerData.position,
          content: markerContent,
          title: markerData.title,
        });

        // Agregar click listener si existe
        if (markerData.onClick) {
          marker.addListener("click", markerData.onClick);
        }

        markersRef.current.push(marker);
      } else {
        // Fallback a Marker antiguo
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
      }
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
