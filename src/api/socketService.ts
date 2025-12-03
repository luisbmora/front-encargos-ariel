// src/api/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  // Nginx se encargará de redirigirlo al backend internamente.
  private readonly url = '/'; 

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        // CAMBIO 2: Path explícito para que coincida con tu Nginx location /socket.io/
        path: '/socket.io/', 
        transports: ['websocket'],
        autoConnect: true,
        secure: true, // Importante porque estamos en HTTPS
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