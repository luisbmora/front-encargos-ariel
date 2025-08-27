// src/api/orderApi.ts
import axios from './axios';
import { Order, CreateOrderRequest, UpdateOrderRequest, AssignOrderRequest } from '../types/order';

export const orderApi = {
  // Obtener todos los pedidos
  getAll: async (): Promise<Order[]> => {
    const response = await axios.get('/orders');
    return response.data;
  },

  // Obtener pedido por ID
  getById: async (id: string): Promise<Order> => {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
  },

  // Crear nuevo pedido
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await axios.post('/orders', data);
    return response.data;
  },

  // Actualizar pedido
  update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
    const response = await axios.put(`/orders/${id}`, data);
    return response.data;
  },

  // Eliminar pedido
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/orders/${id}`);
  },

  // Actualizar estado del pedido
  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await axios.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Asignar repartidor a pedido
  assignDelivery: async (data: AssignOrderRequest): Promise<Order> => {
    const response = await axios.post(`/orders/${data.orderId}/assign`, {
      deliveryId: data.deliveryId,
    });
    return response.data;
  },

  // Desasignar repartidor
  unassignDelivery: async (orderId: string): Promise<Order> => {
    const response = await axios.delete(`/orders/${orderId}/assign`);
    return response.data;
  },

  // Obtener pedidos por estado
  getByStatus: async (status: Order['status']): Promise<Order[]> => {
    const response = await axios.get(`/orders?status=${status}`);
    return response.data;
  },

  // Obtener pedidos de un repartidor
  getByDelivery: async (deliveryId: string): Promise<Order[]> => {
    const response = await axios.get(`/orders?deliveryId=${deliveryId}`);
    return response.data;
  },
};