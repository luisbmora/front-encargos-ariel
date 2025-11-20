// src/types/delivery.ts
export interface Delivery {
  _id: string;
  nombre: string;
  telefono: string;
  email: string;
  password?: string;
  firebaseToken?: string;
  activo: boolean;
  pedidosAsignados: string[];
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeliveryRequest {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
  firebaseToken?: string;
}

export interface UpdateDeliveryRequest {
  nombre?: string;
  telefono?: string;
  email?: string;
  password?: string;
  firebaseToken?: string;
  activo?: boolean;
}