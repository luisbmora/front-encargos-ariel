import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketDelivery {
  repartidorId: string;
  latitud: number;
  longitud: number;
  velocidad?: number;
  estado: 'conectado' | 'desconectado' | 'activo' | 'en_pausa' | 'inactivo';
  timestamp?: string;
}

export interface SocketStats {
  ubicaciones?: {
    repartidoresActivos: number;
    totalUbicaciones24h: number;
    porEstado: { _id: string; count: number }[];
  };
}

export const useAdminSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState<SocketDelivery[]>([]);
  const [stats, setStats] = useState<SocketStats | null>(null);
  
  // Estado para notificar a las páginas que hubo un cambio de estado en un pedido
  const [latestOrderUpdate, setLatestOrderUpdate] = useState<any>(null);
  
  const [socketId, setSocketId] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<string>('General');

  const activeDeliveriesRef = useRef<SocketDelivery[]>([]);

  useEffect(() => {
    activeDeliveriesRef.current = activeDeliveries;
  }, [activeDeliveries]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('⚠️ Admin Socket: No token found');
        return;
    }

    // --- CORRECCIÓN DE MIXED CONTENT ---
    // 1. Detectamos si estamos en local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // 2. Definimos la URL:
    // - Local: IP Directa (HTTP) con puerto 3000
    // - Prod: '/' (HTTPS vía Nginx Proxy)
    const socketUrl = isLocal ? 'http://152.67.233.117:3000' : '/';

    console.log(`🔌 Admin Socket: Conectando a ${socketUrl} (Modo: ${isLocal ? 'Local' : 'Proxy Nginx'})...`);

    const socketInstance = io(socketUrl, {
      auth: { token },
      // Importante: 'path' debe coincidir con tu config de Nginx location /socket.io/
      path: '/socket.io/', 
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      secure: !isLocal, // En prod usamos secure (WSS)
    });

    socketInstance.on('connect', () => {
      console.log('✅ Admin Socket: CONECTADO');
      setIsConnected(true);
      setSocketId(socketInstance.id || '');
      
      socketInstance.emit('solicitar_ubicaciones');
      socketInstance.emit('solicitar_estadisticas');
      
      // Unirse explícitamente a la sala de admins si el backend lo requiere
      socketInstance.emit('join_room', 'admins');
    });

    socketInstance.on('joined_room', (room: string) => {
        console.log(`🏠 Admin Socket: Ingresado a la sala: ${room}`);
        setCurrentRoom(room);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Admin Socket: Error de conexión:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ Admin Socket: Desconectado:', reason);
      setIsConnected(false);
      setSocketId('');
    });

    // --- EVENTOS DE REPARTIDORES ---

    socketInstance.on('ubicaciones_actuales', (ubicaciones: SocketDelivery[]) => {
      if (Array.isArray(ubicaciones)) {
          setActiveDeliveries(ubicaciones);
      }
    });

    socketInstance.on('ubicacion_actualizada', (data: SocketDelivery) => handleUpdateDelivery(data));
    
    socketInstance.on('location_update', (data: any) => {
      // console.log(`${data.latitude}, ${data.longitude}`); 
      const deliveryData: SocketDelivery = {
        repartidorId: data.userId,
        latitud: data.latitude,
        longitud: data.longitude,
        velocidad: data.speed,
        estado: 'activo',
        timestamp: data.timestamp
      };
      handleUpdateDelivery(deliveryData);
    });

    socketInstance.on('repartidor_estado_cambiado', (data: { repartidorId: string, estado: any }) => {
      console.log(`🔄 Estado Repartidor: ${data.repartidorId} -> ${data.estado}`);
      setActiveDeliveries(prev => {
        const index = prev.findIndex(d => d.repartidorId === data.repartidorId);
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], estado: data.estado };
          return newArr;
        } else {
          return [...prev, {
            repartidorId: data.repartidorId,
            latitud: 0, longitud: 0, estado: data.estado, velocidad: 0
          }];
        }
      });
    });

    // --- NUEVO: EVENTO DE CAMBIO DE ESTADO DE PEDIDO ---
    socketInstance.on('delivery_status_change', (data: { orderId: string, status: string, repartidorId: string, timestamp: any }) => {
        console.log('📦 Cambio de estado recibido (Socket):', data);
        
        const updateData = {
            _id: data.orderId,
            estado: data.status,
            repartidorAsignado: data.repartidorId,
            updatedAt: data.timestamp
        };
        
        setLatestOrderUpdate(updateData);
    });

    socketInstance.on('order_update', (data: any) => {
        if (data.type === 'delivery_status_change') {
             console.log('📦 Order Update recibido (Socket):', data);
             setLatestOrderUpdate({
                _id: data.orderId,
                estado: data.status,
                updatedAt: data.timestamp
             });
        }
    });

    socketInstance.on('estadisticas_actuales', (newStats: SocketStats) => {
      setStats(newStats);
    });

    const handleUpdateDelivery = (data: SocketDelivery) => {
      setActiveDeliveries(prev => {
        const index = prev.findIndex(d => d.repartidorId === data.repartidorId);
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], ...data };
          return newArr;
        } else {
          return [...prev, data];
        }
      });
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const enviarNotificacion = useCallback((tipo: 'asignacion' | 'urgente' | 'recordatorio', datos: any) => {
    if (socket && isConnected) {
      const payload = {
        repartidorId: datos.repartidorId,
        encargoId: datos.encargoId || 'general',
        tipo: tipo,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        datos: datos.extraData
      };
      socket.emit('enviar_notificacion', payload);
      console.log('🔔 Admin Socket: Notificación enviada:', payload);
      return true;
    }
    return false;
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    activeDeliveries,
    stats,
    enviarNotificacion,
    socketId,
    currentRoom,
    latestOrderUpdate
  };
};