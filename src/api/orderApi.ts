// src/api/orderApi.ts
import axios from './axios';
import { Order, CreateOrderRequest, UpdateOrderRequest, OrderFilters } from '../types/order';

export const orderApi = {
  // Obtener todos los encargos con filtros opcionales
  getAll: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.repartidorAsignado) params.append('repartidorAsignado', filters.repartidorAsignado);
      if (filters.prioridad) params.append('prioridad', filters.prioridad);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde.toISOString());
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta.toISOString());
    }
    
    const response = await axios.get(`/encargos?${params.toString()}`);
    return response.data.data; // <-- solo el array de encargos
  },

  // Obtener estadísticas de encargos
  getStats: async (): Promise<any> => {
    const response = await axios.get('/encargos/estadisticas');
    return response.data.data;
  },

  // Obtener encargo por ID
  getById: async (id: string): Promise<Order> => {
    const response = await axios.get(`/encargos/${id}`);
    return response.data.data;
  },

  // Obtener encargos por repartidor
  getByDelivery: async (deliveryId: string): Promise<Order[]> => {
    const response = await axios.get(`/encargos/repartidor/${deliveryId}`);
    return response.data.data;
  },

  // Crear nuevo encargo
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await axios.post('/encargos', data);
    return response.data.data;
  },

  // Actualizar encargo
  update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
    const response = await axios.put(`/encargos/${id}`, data);
    return response.data.data;
  },

  // Eliminar encargo
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/encargos/${id}`);
  },

  // Cambiar estado del encargo
  updateStatus: async (id: string, estado: Order['estado']): Promise<Order> => {
    const response = await axios.put(`/encargos/${id}/estado`, { estado });
    return response.data.data;
  },

  // Asignar repartidor a encargo
  assignDelivery: async (orderId: string, deliveryId: string): Promise<Order> => {
    const response = await axios.post(`/encargos/${orderId}/asignar-repartidor`, { repartidorId: deliveryId });
    return response.data.data;
  },

  // Desasignar repartidor
  unassignDelivery: async (orderId: string): Promise<Order> => {
    const response = await axios.delete(`/encargos/${orderId}/desasignar-repartidor`);
    return response.data.data;
  },
};
