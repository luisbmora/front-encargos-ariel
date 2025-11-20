// src/types/order.ts
export interface Order {
  _id: string;
  nombre: string;
  descripcion?: string;
  direccionRecogida: string;
  direccionEntrega: string;
  clienteNombre: string;
  clienteTelefono: string;
  precio: number;
  estado: 'pendiente' | 'asignado' | 'en_camino' | 'entregado' | 'cancelado';
  repartidorAsignado?: string;
  fechaCreacion: Date;
  fechaAsignacion?: Date;
  fechaEntrega?: Date;
  notas?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  repartidorInfo?: {
    nombre: string;
    telefono: string;
  };
}

export interface CreateOrderRequest {
  nombre: string;
  descripcion?: string;
  direccionRecogida: string;
  direccionEntrega: string;
  clienteNombre: string;
  clienteTelefono: string;
  precio: number;
  notas?: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
}

export interface UpdateOrderRequest {
  nombre?: string;
  descripcion?: string;
  direccionRecogida?: string;
  direccionEntrega?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  precio?: number;
  estado?: 'pendiente' | 'asignado' | 'en_camino' | 'entregado' | 'cancelado';
  notas?: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
}

export interface AssignOrderRequest {
  orderId: string;
  deliveryId: string;
}

export interface OrderFilters {
  estado?: string;
  repartidorAsignado?: string;
  prioridad?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}