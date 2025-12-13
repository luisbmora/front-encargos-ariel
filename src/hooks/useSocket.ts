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

    const handleDeliveryStatusUpdate = (data: any) => {
      console.log('📦 Actualización de estado de entrega:', data);
      setOrders(prev => {
        const index = prev.findIndex(order => order._id === data.pedidoId || order.id === data.pedidoId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], estado: data.estado };
          return updated;
        }
        return prev;
      });
    };

    socket.subscribeToOrderUpdates(handleOrderUpdate);
    socket.subscribeToDeliveryStatusUpdates(handleDeliveryStatusUpdate);

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

export const useNotificationMonitor = (initialOrders: any[]) => {
  const [ordersWithStatus, setOrdersWithStatus] = useState<any[]>(initialOrders);
  const { socket } = useSocket();

  // Sincronizar si cambian los pedidos iniciales (ej: carga de API)
  useEffect(() => {
    setOrdersWithStatus(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    // 1. Manejar envío (Servidor -> Socket)
    const handleSent = (data: any) => {
      setOrdersWithStatus(prev => prev.map(order => {
        // Asumiendo que el pedido tiene un campo 'notificacionId' o vinculas por 'id'
        if (order.notificacionId === data.notificacionId) {
            return { ...order, notificacionEstado: data.estado };
        }
        return order;
      }));
    };

    // 2. Manejar recepción (Celular -> Servidor -> Admin)
    const handleReceived = (data: { notificacionIds: string[] }) => {
      console.log('📱 Confirmación recibida:', data.notificacionIds);
      setOrdersWithStatus(prev => prev.map(order => {
        if (data.notificacionIds.includes(order.notificacionId)) {
          return { ...order, notificacionEstado: 'RECIBIDA' };
        }
        return order;
      }));
    };

    // Suscribirse
    socket.subscribeToNotificationSent(handleSent);
    socket.subscribeToNotificationReceived(handleReceived);

    return () => {
      socket.unsubscribeFromNotifications();
    };
  }, [socket]);

  return ordersWithStatus;
};