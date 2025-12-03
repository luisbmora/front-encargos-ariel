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

const SOCKET_URL = 'http://152.67.233.117';

export const useAdminSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState<SocketDelivery[]>([]);
  const [stats, setStats] = useState<SocketStats | null>(null);
  
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

    console.log(`🔌 Admin Socket: Conectando...`);

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Admin Socket: CONECTADO');
      setIsConnected(true);
      setSocketId(socketInstance.id || '');
      
      socketInstance.emit('solicitar_ubicaciones');
      socketInstance.emit('solicitar_estadisticas');
    });

    socketInstance.on('joined_room', (room: string) => {
        console.log(`🏠 Admin Socket: Ingresado a la sala: ${room}`);
        setCurrentRoom(room);
    });

    // --- CONFIRMACIONES DE NOTIFICACIÓN (NUEVO) ---
    socketInstance.on('notificacion_enviada', (data: any) => {
        console.log('✅ Admin Socket: Servidor confirmó envío de notificación:', data);
    });

    socketInstance.on('notificacion_respondida', (data: any) => {
        console.log('💬 Admin Socket: Repartidor respondió:', data);
    });

    socketInstance.on('error', (err: any) => {
      console.error('❌ Admin Socket: Error reportado por servidor:', err);
    });
    // ----------------------------------------------

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Admin Socket: Error de conexión:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ Admin Socket: Desconectado:', reason);
      setIsConnected(false);
      setSocketId('');
    });

    // --- EVENTOS DE DATOS ---

    socketInstance.on('ubicaciones_actuales', (ubicaciones: SocketDelivery[]) => {
      console.log(`📍 Recibidas ${ubicaciones?.length || 0} ubicaciones actuales`);
      if (Array.isArray(ubicaciones)) {
          setActiveDeliveries(ubicaciones);
      }
    });

    socketInstance.on('ubicacion_actualizada', (data: SocketDelivery) => {
      handleUpdateDelivery(data);
    });

    socketInstance.on('location_update', (data: any) => {
      // Log de coordenadas solicitado anteriormente
      console.log(`${data.latitude}, ${data.longitude}`);
      
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
      console.log(`🔄 Estado: ${data.repartidorId} -> ${data.estado}`);
      
      setActiveDeliveries(prev => {
        const index = prev.findIndex(d => d.repartidorId === data.repartidorId);
        
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], estado: data.estado };
          return newArr;
        } else {
          return [...prev, {
            repartidorId: data.repartidorId,
            latitud: 0, 
            longitud: 0,
            estado: data.estado,
            velocidad: 0
          }];
        }
      });
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
      
      // Log para verificar exactamente qué sale del front
      console.log('📤 Emitiendo enviar_notificacion:', payload);
      socket.emit('enviar_notificacion', payload);
      return true;
    }
    console.warn('⚠️ No se pudo enviar: Socket desconectado');
    return false;
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    activeDeliveries,
    stats,
    enviarNotificacion,
    socketId,
    currentRoom
  };
};