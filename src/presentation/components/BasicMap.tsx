import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Box, Alert } from "@mui/material";

interface MapDelivery {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  isActive: boolean;
  phone?: string;
}

interface MapOrder {
  id: string;
  title: string;
  location?: { lat: number; lng: number };
  state: string;
}

interface BasicMapProps {
  deliveries: MapDelivery[];
  orders: MapOrder[];
}

const BasicMap: React.FC<BasicMapProps> = ({ deliveries, orders }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string>("");
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyArRZ1oMeBMdwpLIB3hssEt_99ceKdzV5s", // Tu API Key
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();

        if (mapRef.current && !map) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 20.659698, lng: -103.349609 }, // Centro default
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            }
          });
          setMap(mapInstance);
        }
      } catch (err) {
        console.error("Error cargando Google Maps:", err);
        setError("Error cargando el mapa.");
      }
    };

    initMap();
  }, [map]);

  useEffect(() => {
    if (!map || !window.google) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // 1. Pintar Repartidores
    deliveries.forEach((d) => {
        // Validación estricta de coordenadas
        if (!d.location || typeof d.location.lat !== 'number' || typeof d.location.lng !== 'number') return;
        if (d.location.lat === 0 && d.location.lng === 0) return;

        const marker = new google.maps.Marker({
            position: d.location,
            map: map,
            title: d.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: d.isActive ? "#4caf50" : "#f44336",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
            },
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color:black; font-weight:bold;">${d.name}</div><div style="color:#555;">${d.phone || ''}</div>`
        });
        marker.addListener('click', () => infoWindow.open(map, marker));

        markersRef.current.push(marker);
    });

    // 2. Pintar Ordenes
    orders.forEach((o) => {
        if (!o.location || typeof o.location.lat !== 'number') return;
        if (o.location.lat === 0 && o.location.lng === 0) return;

        const marker = new google.maps.Marker({
            position: o.location,
            map: map,
            title: o.title,
            zIndex: 1, 
            icon: {
                 path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                 fillColor: "#1976d2",
                 fillOpacity: 1,
                 strokeWeight: 1,
                 strokeColor: "#ffffff",
                 scale: 1.5,
                 anchor: new google.maps.Point(12, 24),
            }
        });
        markersRef.current.push(marker);
    });

  }, [map, deliveries, orders]);

  if (error) return <Alert severity="error">{error}</Alert>;

  return <Box ref={mapRef} sx={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }} />;
};

export default BasicMap;