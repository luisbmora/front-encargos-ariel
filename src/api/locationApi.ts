// src/api/locationApi.ts
import axios from './axios';

export interface LocationResponse {
  success: boolean;
  data: {
    _id: string;
    repartidorId: {
      _id: string;
      nombre: string;
      telefono: string;
      activo: boolean;
    };
    latitud: number;
    longitud: number;
    precision: number;
    timestamp: string;
    estado: string;
  };
}

export interface DeliveryLocation {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
  precision: number;
  timestamp: string;
  status: string;
}

export const locationApi = {
  // Obtener ubicación de un repartidor específico usando axios (con token automático)
  getDeliveryLocation: async (repartidorId: string): Promise<DeliveryLocation | null> => {
    try {
      const response = await axios.get(`/ubicaciones/repartidor/${repartidorId}`);
      const data: LocationResponse = response.data;
      
      if (data.success && data.data) {
        return {
          id: data.data.repartidorId._id,
          name: data.data.repartidorId.nombre,
          phone: data.data.repartidorId.telefono,
          isActive: data.data.repartidorId.activo,
          location: {
            lat: data.data.latitud,
            lng: data.data.longitud,
          },
          precision: data.data.precision,
          timestamp: data.data.timestamp,
          status: data.data.estado,
        };
      }
      return null;
    } catch (error: any) {
      console.error('Error obteniendo ubicación del repartidor:', error);
      
      // Manejar errores específicos
      if (error.response?.status === 401) {
        console.error('Token expirado o inválido');
      }
      
      return null;
    }
  },

  // Método alternativo usando fetch (para debugging)
  getDeliveryLocationWithFetch: async (repartidorId: string): Promise<DeliveryLocation | null> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de acceso no encontrado');
      }

      const response = await fetch(`https://api-encargos-ariel.onrender.com/api/ubicaciones/repartidor/${repartidorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Token expirado. Redirigiendo al login...');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LocationResponse = await response.json();
      
      if (data.success && data.data) {
        return {
          id: data.data.repartidorId._id,
          name: data.data.repartidorId.nombre,
          phone: data.data.repartidorId.telefono,
          isActive: data.data.repartidorId.activo,
          location: {
            lat: data.data.latitud,
            lng: data.data.longitud,
          },
          precision: data.data.precision,
          timestamp: data.data.timestamp,
          status: data.data.estado,
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo ubicación del repartidor:', error);
      return null;
    }
  },

  // Obtener ubicaciones de múltiples repartidores
  getMultipleDeliveryLocations: async (repartidorIds: string[]): Promise<DeliveryLocation[]> => {
    try {
      const promises = repartidorIds.map(id => locationApi.getDeliveryLocation(id));
      const results = await Promise.all(promises);
      return results.filter(location => location !== null) as DeliveryLocation[];
    } catch (error) {
      console.error('Error obteniendo ubicaciones múltiples:', error);
      return [];
    }
  },

  // Obtener todos los repartidores desde la API
  getAllDeliveries: async (): Promise<any[]> => {
    try {
      const response = await axios.get('/repartidores');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error obteniendo repartidores:', error);
      return [];
    }
  },

  // Obtener todas las ubicaciones activas
  getAllActiveLocations: async (): Promise<DeliveryLocation[]> => {
    try {
      // Primero obtener todos los repartidores
      const deliveries = await locationApi.getAllDeliveries();
      
      if (deliveries.length === 0) {
        // Fallback: usar IDs conocidos
        const knownIds = [
          '68b1250b5eb8750fe343f177', // David M
          // Agrega más IDs aquí si los conoces
        ];
        return await locationApi.getMultipleDeliveryLocations(knownIds);
      }

      // Obtener ubicaciones de todos los repartidores activos
      const activeDeliveryIds = deliveries
        .filter(d => d.activo)
        .map(d => d._id);
      
      return await locationApi.getMultipleDeliveryLocations(activeDeliveryIds);
    } catch (error) {
      console.error('Error obteniendo todas las ubicaciones:', error);
      // Fallback: usar ID conocido
      return await locationApi.getMultipleDeliveryLocations(['68b1250b5eb8750fe343f177']);
    }
  },

  // Método para obtener ubicaciones con fallback mejorado
  getAllLocationsWithFallback: async (): Promise<DeliveryLocation[]> => {
    try {
      console.log('🔍 Intentando obtener todos los repartidores...');
      
      // Primero intentar obtener todos los repartidores desde la API
      const allDeliveries = await locationApi.getAllDeliveries();
      console.log('📋 Repartidores encontrados:', allDeliveries.length);
      
      if (allDeliveries.length > 0) {
        // Obtener ubicaciones de todos los repartidores activos
        const activeDeliveryIds = allDeliveries
          .filter(d => d.activo)
          .map(d => d._id);
        
        console.log('✅ Repartidores activos:', activeDeliveryIds.length);
        
        if (activeDeliveryIds.length > 0) {
          const locations = await locationApi.getMultipleDeliveryLocations(activeDeliveryIds);
          console.log('📍 Ubicaciones obtenidas:', locations.length);
          return locations;
        }
      }
      
      // Fallback: usar IDs conocidos
      console.log('⚠️ Usando fallback con IDs conocidos');
      const knownDeliveryIds = [
        '68b1250b5eb8750fe343f177', // David M
        // Agrega más IDs aquí cuando los tengas
      ];

      const locations = await locationApi.getMultipleDeliveryLocations(knownDeliveryIds);
      return locations;
    } catch (error) {
      console.error('❌ Error obteniendo ubicaciones:', error);
      return [];
    }
  },
};