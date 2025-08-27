// src/hooks/useDeliveries.ts
import { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../types/delivery';

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryApi.getAll();
      setDeliveries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar repartidores');
    } finally {
      setLoading(false);
    }
  };

  const createDelivery = async (data: CreateDeliveryRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newDelivery = await deliveryApi.create(data);
      setDeliveries(prev => [...prev, newDelivery]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear repartidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDelivery = async (id: string, data: UpdateDeliveryRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedDelivery = await deliveryApi.update(id, data);
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === id ? updatedDelivery : delivery
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar repartidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDelivery = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await deliveryApi.delete(id);
      setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar repartidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleDeliveryStatus = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedDelivery = await deliveryApi.toggleStatus(id);
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === id ? updatedDelivery : delivery
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    toggleDeliveryStatus,
  };
};