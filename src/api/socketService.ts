// src/api/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly url = 'https://api-encargos-ariel.onrender.com'; // Tu API URL

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor de sockets');
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor de sockets');
      });

      this.socket.on('error', (error) => {
        console.error('Error en socket:', error);
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