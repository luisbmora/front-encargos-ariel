// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { Order, CreateOrderRequest, UpdateOrderRequest, OrderFilters } from '../types/order';
import { AlertService } from '../utils/alerts';

export const useOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (customFilters?: OrderFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll(customFilters || filters);
      setOrders(data); // data ya es un array de Order
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar encargos');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mostrar alerta de carga
      AlertService.loading('Creando pedido...', 'Por favor espera mientras se procesa la información');
      
      const newOrder = await orderApi.create(data);
      setOrders(prev => [...prev, newOrder]);
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      //await AlertService.crud.created('Pedido', `#${newOrder.id.slice(-6)}`);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear pedido';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('crear', 'pedido', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, data: UpdateOrderRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mostrar alerta de carga
      AlertService.loading('Actualizando pedido...', 'Guardando los cambios');
      
      const updatedOrder = await orderApi.update(id, data);
      setOrders(prev => prev.map(order => order._id === id ? updatedOrder : order));
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      await AlertService.crud.updated('Pedido', `#${id.slice(-6)}`);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar pedido';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('actualizar', 'pedido', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string, orderName?: string): Promise<boolean> => {
    try {
      // Mostrar confirmación antes de eliminar
      const result = await AlertService.confirmDelete(
        orderName || `Pedido #${id.slice(-6)}`,
        'pedido'
      );
      
      if (!result.isConfirmed) {
        return false;
      }
      
      setLoading(true);
      setError(null);
      
      // Mostrar alerta de carga
      AlertService.loading('Eliminando pedido...', 'Por favor espera');
      
      await orderApi.delete(id);
      setOrders(prev => prev.filter(order => order._id !== id));
      
      // Cerrar loading y mostrar éxito
      AlertService.close();
      await AlertService.crud.deleted('Pedido', orderName || `#${id.slice(-6)}`);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar pedido';
      setError(errorMessage);
      
      // Cerrar loading y mostrar error
      AlertService.close();
      await AlertService.crud.operationError('eliminar', 'pedido', errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, estado: Order['estado']): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.updateStatus(id, estado);
      setOrders(prev => prev.map(order => order._id === id ? updatedOrder : order));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async (orderId: string, deliveryId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.assignDelivery(orderId, deliveryId);
      setOrders(prev => prev.map(order => order._id === orderId ? updatedOrder : order));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar repartidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unassignDelivery = async (orderId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.unassignDelivery(orderId);
      setOrders(prev => prev.map(order => order._id === orderId ? updatedOrder : order));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desasignar repartidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    assignDelivery,
    unassignDelivery,
  };
};
