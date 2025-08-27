// src/types/delivery.ts
export interface Delivery {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'walking';
  vehiclePlate?: string;
  isActive: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  totalDeliveries?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryRequest {
  name: string;
  email: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'walking';
  vehiclePlate?: string;
}

export interface UpdateDeliveryRequest extends Partial<CreateDeliveryRequest> {
  isActive?: boolean;
}