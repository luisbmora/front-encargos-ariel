// src/hooks/useDeliveries.ts
import { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../types/delivery';
import { AlertService } from '../utils/alerts';

export const useDeliveries = (activo?: boolean) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryApi.getAll(activo);
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
      
      // Mostrar alerta de carga
      AlertService.loading('Creando repartidor...', 'Registrando la información');
      
      const newDelivery = await deliveryApi.create(data);
      setDeliveries(prev => [...prev, newDelivery]);
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      await AlertService.crud.created('Repartidor', data.nombre);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear repartidor';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('crear', 'repartidor', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDelivery = async (id: string, data: UpdateDeliveryRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mostrar alerta de carga
      AlertService.loading('Actualizando repartidor...', 'Guardando los cambios');
      
      const updatedDelivery = await deliveryApi.update(id, data);
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery._id === id ? updatedDelivery : delivery
        )
      );
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      await AlertService.crud.updated('Repartidor', data.nombre || updatedDelivery.nombre);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar repartidor';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('actualizar', 'repartidor', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDelivery = async (id: string, deliveryName?: string): Promise<boolean> => {
    try {
      // Mostrar confirmación antes de eliminar
      const result = await AlertService.confirmDelete(
        deliveryName || 'este repartidor',
        'repartidor'
      );
      
      if (!result.isConfirmed) {
        return false;
      }
      
      setLoading(true);
      setError(null);
      
      // Mostrar alerta de carga
      AlertService.loading('Eliminando repartidor...', 'Por favor espera');
      
      await deliveryApi.delete(id);
      setDeliveries(prev => prev.filter(delivery => delivery._id !== id));
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      await AlertService.crud.deleted('Repartidor', deliveryName);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar repartidor';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('eliminar', 'repartidor', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleDeliveryStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedDelivery = await deliveryApi.update(id, { activo: !currentStatus });
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery._id === id ? updatedDelivery : delivery
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

  const assignOrder = async (id: string, pedidoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedDelivery = await deliveryApi.assignOrder(id, pedidoId);
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery._id === id ? updatedDelivery : delivery
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unassignOrder = async (id: string, pedidoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await deliveryApi.unassignOrder(id, pedidoId);
      // Actualizar localmente eliminando el pedido
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery._id === id 
            ? { ...delivery, pedidosAsignados: delivery.pedidosAsignados.filter(p => p !== pedidoId) }
            : delivery
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desasignar pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [activo]);

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    toggleDeliveryStatus,
    assignOrder,
    unassignOrder,
  };
};