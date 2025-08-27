// src/types/order.ts
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryId?: string; // ID del repartidor asignado
  deliveryName?: string; // Nombre del repartidor
  estimatedDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
  };
  items: Omit<OrderItem, 'id'>[];
  notes?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: Order['status'];
  deliveryId?: string;
  estimatedDeliveryTime?: string;
}

export interface AssignOrderRequest {
  orderId: string;
  deliveryId: string;
}