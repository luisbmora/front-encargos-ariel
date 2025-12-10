// src/api/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  // Definimos la URL dinámicamente basada en la variable de entorno
  // - En Dev: Usamos la IP directa de tu API (HTTP)
  // - En Prod: Usamos '/' para que Nginx haga el túnel seguro (HTTPS)
  private readonly url = process.env.REACT_APP_ENV === 'dev'
    ? 'http://152.67.233.117:3000' 
    : '/';

  connect(): Socket {
    if (!this.socket) {
      console.log(`🔌 Conectando Socket en modo: ${this.isLocal ? 'LOCAL (Directo)' : 'PRODUCCIÓN (Proxy Nginx)'}`);

      this.socket = io(this.url, {
        path: '/socket.io/',
        transports: ['websocket'],
        autoConnect: true,
        // 3. Solo activamos modo seguro si NO estamos en local
        secure: !this.isLocal, 
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor de sockets');
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor de sockets');
      });

      
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Métodos específicos para tu aplicación
  subscribeToOrderUpdates(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('order-update', callback);
    }
  }

  subscribeToDeliveryUpdates(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('delivery-update', callback);
    }
  }

  subscribeToLocationUpdates(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  // Emitir eventos
  updateLocation(deliveryId: string, location: { lat: number; lng: number }): void {
    if (this.socket) {
      this.socket.emit('update-location', { deliveryId, location });
    }
  }

  joinDeliveryRoom(deliveryId: string): void {
    if (this.socket) {
      this.socket.emit('join-delivery', deliveryId);
    }
  }

  leaveDeliveryRoom(deliveryId: string): void {
    if (this.socket) {
      this.socket.emit('leave-delivery', deliveryId);
    }
  }
}

export const socketService = new SocketService();