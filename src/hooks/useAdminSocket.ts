import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Interfaz exacta de los datos que vienen en el array del socket
export interface SocketDelivery {
  repartidorId: string;
  latitud: number;
  longitud: number;
  velocidad?: number;
  estado: 'conectado' | 'desconectado' | 'activo' | 'en_pausa' | 'inactivo';
  timestamp?: string;
}

// Interfaz para las estadísticas
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
  // Aquí se guardan las ubicaciones recibidas
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
      
      // IMPORTANTE: Solicitamos las ubicaciones al conectar
      socketInstance.emit('solicitar_ubicaciones');
      socketInstance.emit('solicitar_estadisticas');
    });

    // ---------------------------------------------------------
    // AQUÍ ESTÁ LA IMPLEMENTACIÓN QUE PIDES (Consumir ubicaciones_actuales)
    // ---------------------------------------------------------
    socketInstance.on('ubicaciones_actuales', (ubicaciones: SocketDelivery[]) => {
      console.log(`📍 Recibidas ${ubicaciones?.length || 0} ubicaciones actuales`);
      
      if (Array.isArray(ubicaciones)) {
          // Reemplazamos la lista completa con lo que nos da el servidor
          setActiveDeliveries(ubicaciones);
      } else {
          console.error('❌ Error: "ubicaciones_actuales" no es un array:', ubicaciones);
      }
    });

    // Actualización individual (cuando se mueven)
    socketInstance.on('ubicacion_actualizada', (data: SocketDelivery) => {
      handleUpdateDelivery(data);
    });

    // Formato alternativo (location_update)
    socketInstance.on('location_update', (data: any) => {
      // LOG SOLICITADO: Coordenadas exactas en consola
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

    // Cambio de estado (Conectado/Desconectado)
    socketInstance.on('repartidor_estado_cambiado', (data: { repartidorId: string, estado: any }) => {
      console.log(`🔄 Estado: ${data.repartidorId} -> ${data.estado}`);
      
      setActiveDeliveries(prev => {
        const index = prev.findIndex(d => d.repartidorId === data.repartidorId);
        
        if (index !== -1) {
          // Actualizar estado existente
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], estado: data.estado };
          return newArr;
        } else {
          // Si es nuevo, agregarlo para que se vea "Conectado"
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

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setSocketId('');
    });

    // Función para actualizar la lista sin duplicados
    const handleUpdateDelivery = (data: SocketDelivery) => {
      setActiveDeliveries(prev => {
        const index = prev.findIndex(d => d.repartidorId === data.repartidorId);
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], ...data }; // Fusionar datos nuevos
          return newArr;
        } else {
          return [...prev, data]; // Agregar nuevo
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
      return true;
    }
    return false;
  }, [socket, isConnected]);

  return {
    isConnected,
    activeDeliveries, // <--- ESTA variable contiene las ubicaciones para tu mapa
    stats,
    enviarNotificacion,
    socketId,
    currentRoom
  };
};