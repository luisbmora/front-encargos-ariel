// src/api/deliveryApi.ts
import axios from './axios';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../types/delivery';

export const deliveryApi = {
  // Obtener todos los repartidores
  getAll: async (): Promise<Delivery[]> => {
    const response = await axios.get('/deliveries');
    return response.data;
  },

  // Obtener repartidor por ID
  getById: async (id: string): Promise<Delivery> => {
    const response = await axios.get(`/deliveries/${id}`);
    return response.data;
  },

  // Crear nuevo repartidor
  create: async (data: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await axios.post('/deliveries', data);
    return response.data;
  },

  // Actualizar repartidor
  update: async (id: string, data: UpdateDeliveryRequest): Promise<Delivery> => {
    const response = await axios.put(`/deliveries/${id}`, data);
    return response.data;
  },

  // Eliminar repartidor
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/deliveries/${id}`);
  },

  // Activar/Desactivar repartidor
  toggleStatus: async (id: string): Promise<Delivery> => {
    const response = await axios.patch(`/deliveries/${id}/toggle-status`);
    return response.data;
  },

  // Obtener repartidores activos
  getActive: async (): Promise<Delivery[]> => {
    const response = await axios.get('/deliveries?status=active');
    return response.data;
  },
};