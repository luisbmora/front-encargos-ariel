// src/api/deliveryApi.ts
import axios from './axios';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../types/delivery';

export const deliveryApi = {
  // Obtener todos los repartidores
  getAll: async (activo?: boolean): Promise<Delivery[]> => {
    const params = activo !== undefined ? { activo } : {};
    const response = await axios.get('/repartidores', { params });
    //console.log("API /repartidores ->", response.data);
    return response.data.data;
  },

  // Obtener repartidor por ID
  getById: async (id: string): Promise<Delivery> => {
    const response = await axios.get(`/repartidores/${id}`);
    return response.data.data;
  },

  // Crear nuevo repartidor
  create: async (data: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await axios.post('/repartidores', data);
    return response.data.data;
  },

  // Actualizar repartidor
  update: async (id: string, data: UpdateDeliveryRequest): Promise<Delivery> => {
    const response = await axios.put(`/repartidores/${id}`, data);
    return response.data.data;
  },

  // Eliminar repartidor
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/repartidores/${id}`);
  },

  // Asignar pedido a repartidor
  assignOrder: async (id: string, pedidoId: string): Promise<Delivery> => {
    const response = await axios.post(`/repartidores/${id}/asignar-pedido`, { pedidoId });
    return response.data.data;
  },

  // Desasignar pedido de repartidor
  unassignOrder: async (id: string, pedidoId: string): Promise<void> => {
    await axios.delete(`/repartidores/${id}/pedidos/${pedidoId}`);
  },

  // Actualizar token de Firebase
  updateFirebaseToken: async (id: string, firebaseToken: string): Promise<Delivery> => {
    const response = await axios.put(`/repartidores/${id}/firebase-token`, { firebaseToken });
    return response.data.data;
  },
};