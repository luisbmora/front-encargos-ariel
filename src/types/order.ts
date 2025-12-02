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
  repartidorAsignado?: string | any; // Actualizado a 'any' o 'string' para manejar objetos populados si es necesario
  fechaCreacion: Date | string;
  fechaAsignacion?: Date;
  fechaEntrega?: Date;
  notas?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  repartidorInfo?: {
    nombre: string;
    telefono: string;
  };
  // --- NUEVO CAMPO ---
  imagenUrl?: string; // URL de la imagen en Oracle Cloud
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
  // --- NUEVO CAMPO ---
  imagen?: File | null; // Para el formulario de subida
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