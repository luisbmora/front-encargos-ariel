// src/hooks/useRealTimeLocations.ts
import { useState, useEffect, useCallback } from 'react';
import { locationApi, DeliveryLocation } from '../api/locationApi';

export const useRealTimeLocations = (repartidorIds: string[] = [], refreshInterval: number = 30000) => {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    if (repartidorIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const newLocations = await locationApi.getMultipleDeliveryLocations(repartidorIds);
      setLocations(newLocations);
    } catch (err: any) {
      setError('Error al obtener ubicaciones de repartidores');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  }, [repartidorIds]);

  // Obtener ubicación de un repartidor específico
  const getLocationById = useCallback(async (repartidorId: string) => {
    try {
      const location = await locationApi.getDeliveryLocation(repartidorId);
      if (location) {
        setLocations(prev => {
          const filtered = prev.filter(loc => loc.id !== repartidorId);
          return [...filtered, location];
        });
      }
      return location;
    } catch (err) {
      console.error('Error getting location by ID:', err);
      return null;
    }
  }, []);

  // Efecto para cargar ubicaciones iniciales
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Efecto para actualización automática
  useEffect(() => {
    if (repartidorIds.length === 0) return;

    const interval = setInterval(() => {
      fetchLocations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchLocations, refreshInterval]);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    getLocationById,
  };
};

// Hook específico para obtener todas las ubicaciones activas
export const useAllActiveLocations = (refreshInterval: number = 30000) => {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newLocations = await locationApi.getAllActiveLocations();
      setLocations(newLocations);
    } catch (err: any) {
      setError('Error al obtener ubicaciones activas');
      console.error('Error fetching all locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLocations();
  }, [fetchAllLocations]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllLocations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAllLocations, refreshInterval]);

  return {
    locations,
    loading,
    error,
    fetchAllLocations,
  };
};