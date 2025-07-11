'use client';

import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private restaurantId: string | null = null;

  connect(restaurantId: string) {
    if (this.socket && this.restaurantId === restaurantId) {
      return this.socket;
    }

    this.disconnect();
    this.restaurantId = restaurantId;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      auth: {
        restaurantId
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket?.emit('join_restaurant', restaurantId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketClient = new SocketClient();