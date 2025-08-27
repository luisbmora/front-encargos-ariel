// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { socketService } from '../api/socketService';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    isConnected,
    socket: socketService,
  };
};

// Hook específico para actualizaciones de pedidos
export const useOrderUpdates = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    const handleOrderUpdate = (data: any) => {
      setOrders(prev => {
        const index = prev.findIndex(order => order.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
    };

    socket.subscribeToOrderUpdates(handleOrderUpdate);

    return () => {
      // Cleanup si es necesario
    };
  }, [socket]);

  return orders;
};

// Hook para actualizaciones de ubicación de repartidores
export const useDeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState<Map<string, any>>(new Map());
  const { socket } = useSocket();

  useEffect(() => {
    const handleLocationUpdate = (data: any) => {
      setDeliveries(prev => {
        const updated = new Map(prev);
        updated.set(data.deliveryId, data);
        return updated;
      });
    };

    socket.subscribeToLocationUpdates(handleLocationUpdate);

    return () => {
      // Cleanup si es necesario
    };
  }, [socket]);

  return Array.from(deliveries.values());
};