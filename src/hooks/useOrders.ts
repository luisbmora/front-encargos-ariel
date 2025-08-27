// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { Order, CreateOrderRequest, UpdateOrderRequest, AssignOrderRequest } from '../types/order';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await orderApi.create(data);
      setOrders(prev => [...prev, newOrder]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, data: UpdateOrderRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.update(id, data);
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? updatedOrder : order
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await orderApi.delete(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar pedido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.updateStatus(id, status);
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? updatedOrder : order
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async (data: AssignOrderRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderApi.assignDelivery(data);
      setOrders(prev => 
        prev.map(order => 
          order.id === data.orderId ? updatedOrder : order
        )
      );
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
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
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