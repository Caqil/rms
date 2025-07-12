
import { io, Socket } from 'socket.io-client';

export interface OrderUpdate {
  orderId: string;
  status: string;
  tableNumber?: string;
  orderNumber: string;
  restaurantId: string;
}

export interface NewOrderData {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  items: any[];
  status: string;
  orderType: string;
  total: number;
  restaurantId: string;
}

export interface NotificationData {
  _id: string;
  type: 'order' | 'kitchen' | 'inventory' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  timestamp: Date;
}

export interface KitchenUpdate {
  orderId: string;
  status: 'preparing' | 'ready' | 'served';
  estimatedTime?: number;
  actualTime?: number;
}

class SocketManager {
  private socket: Socket | null = null;
  private restaurantId: string | null = null;
  private authToken: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Initialize WebSocket connection
  async connect(restaurantId: string, authToken: string): Promise<SocketManager> {
    this.restaurantId = restaurantId;
    this.authToken = authToken;

    try {
      console.log('🔌 Connecting to WebSocket server...', { restaurantId });

      // Initialize Socket.IO client
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: {
          token: authToken,
          restaurantId: restaurantId,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: 10000,
        forceNew: true,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Join restaurant room
      this.socket.emit('join-restaurant', { restaurantId, authToken });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ WebSocket connected successfully');
          this.startHeartbeat();
          resolve(this);
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket connection failed:', error);
          this.handleReconnection();
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      throw error;
    }
  }

  // Setup all event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔗 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
      this.stopHeartbeat();
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.isConnected = false;
      this.handleReconnection();
    });

    // Server events
    this.socket.on('restaurant-joined', (data) => {
      console.log('🏢 Joined restaurant room:', data);
    });

    this.socket.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
    });

    // Keep-alive response
    this.socket.on('pong', () => {
      console.log('🏓 Heartbeat response received');
    });
  }

  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.restaurantId && this.authToken) {
        this.connect(this.restaurantId, this.authToken).catch(console.error);
      }
    }, delay);
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        console.log('🏓 Sending heartbeat');
        this.socket.emit('ping');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event subscription methods
  onNewOrder(callback: (order: NewOrderData) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('new_order', callback);
    return () => this.socket?.off('new_order', callback);
  }

  onOrderStatusUpdate(callback: (update: OrderUpdate) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('order_status_update', callback);
    return () => this.socket?.off('order_status_update', callback);
  }

  onKitchenUpdate(callback: (update: KitchenUpdate) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('kitchen_update', callback);
    return () => this.socket?.off('kitchen_update', callback);
  }

  onNewNotification(callback: (notification: NotificationData) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('new_notification', callback);
    return () => this.socket?.off('new_notification', callback);
  }

  onInventoryUpdate(callback: (update: any) => void): () => void {
    if (!this.socket) return () => {};
    
    this.socket.on('inventory_update', callback);
    return () => this.socket?.off('inventory_update', callback);
  }

  // Emit events to server
  async emitOrderStatusUpdate(orderId: string, status: string, notes?: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('update_order_status', 
        { orderId, status, notes, restaurantId: this.restaurantId },
        (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to update order status'));
          }
        }
      );
    });
  }

  async emitKitchenUpdate(orderId: string, status: string, estimatedTime?: number): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('kitchen_update', 
        { orderId, status, estimatedTime, restaurantId: this.restaurantId },
        (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to send kitchen update'));
          }
        }
      );
    });
  }

  async emitInventoryUpdate(itemId: string, quantity: number, action: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('inventory_update', 
        { itemId, quantity, action, restaurantId: this.restaurantId },
        (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to update inventory'));
          }
        }
      );
    });
  }

  // Connection status methods
  isSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }

  // Disconnect and cleanup
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.restaurantId = null;
    this.authToken = null;
    this.reconnectAttempts = 0;
  }

  // Debug information
  getDebugInfo(): any {
    return {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected || false,
      socketId: this.socket?.id,
      restaurantId: this.restaurantId,
      reconnectAttempts: this.reconnectAttempts,
      hasSocket: !!this.socket,
      connectionStatus: this.getConnectionStatus(),
    };
  }
}

// Create singleton instance
export const socketManager = new SocketManager();