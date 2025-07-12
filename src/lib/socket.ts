// src/lib/socket.ts
// Simplified version that works with App Router limitations

interface OrderUpdate {
  orderId: string;
  status: string;
  tableNumber?: string;
  orderNumber: string;
  restaurantId: string;
}

interface NewOrderData {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  items: any[];
  status: string;
  orderType: string;
  total: number;
  restaurantId: string;
}

interface NotificationData {
  _id: string;
  type: 'order' | 'kitchen' | 'inventory' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
}

class SocketManager {
  private isInitialized = false;
  private restaurantId: string | null = null;
  private eventListeners = new Map();
  private isPollingMode = true; // We're using polling instead of WebSocket

  async connect(restaurantId: string, authToken: string) {
    this.restaurantId = restaurantId;
    
    console.log('🔌 Connecting to notification system...', { restaurantId });
    
    // Initialize the "server" (actually just polling)
    await this.initializeServer();
    
    // Simulate connection success
    setTimeout(() => {
      console.log('✅ Connected to notification system (polling mode)');
      this.triggerEvent('connect', { restaurantId });
    }, 500);
    
    return this;
  }

  // Initialize the server
  async initializeServer(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    try {
      console.log('🔧 Initializing notification system...');
      
      const response = await fetch('/api/socket', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Notification system initialized:', result.message);
        this.isInitialized = true;
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize notification system:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  // Event listener management
  private triggerEvent(eventName: string, data: any) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach((callback: Function) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  private addEventListener(eventName: string, callback: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
    
    return () => {
      const listeners = this.eventListeners.get(eventName) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Event handlers (simulate WebSocket events)
  onNewOrder(callback: (order: NewOrderData) => void) {
    return this.addEventListener('new_order', callback);
  }

  onOrderStatusUpdate(callback: (update: OrderUpdate) => void) {
    return this.addEventListener('order_status_update', callback);
  }

  onOrderPriorityUpdate(callback: (update: { orderId: string; priority: string }) => void) {
    return this.addEventListener('order_priority_update', callback);
  }

  onNewNotification(callback: (notification: NotificationData) => void) {
    return this.addEventListener('new_notification', callback);
  }

  // Emit events (send to server via HTTP)
  async emitOrderStatusUpdate(orderId: string, status: string, notes?: string) {
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_status_update',
          data: {
            orderId,
            status,
            notes,
            restaurantId: this.restaurantId
          }
        })
      });

      if (response.ok) {
        console.log('📤 Order status update sent:', { orderId, status });
        
        // Trigger local event for immediate feedback
        this.triggerEvent('order_status_update', {
          orderId,
          status,
          restaurantId: this.restaurantId
        });
      }
    } catch (error) {
      console.error('Error sending order status update:', error);
    }
  }

  async emitOrderPriorityUpdate(orderId: string, priority: string) {
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_priority_update',
          data: {
            orderId,
            priority,
            restaurantId: this.restaurantId
          }
        })
      });

      if (response.ok) {
        console.log('📤 Order priority update sent:', { orderId, priority });
        
        // Trigger local event
        this.triggerEvent('order_priority_update', {
          orderId,
          priority
        });
      }
    } catch (error) {
      console.error('Error sending order priority update:', error);
    }
  }

  async emitNewOrder(orderData: any) {
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_order',
          data: {
            ...orderData,
            restaurantId: this.restaurantId
          }
        })
      });

      if (response.ok) {
        console.log('📤 New order event sent:', orderData.orderNumber);
        
        // Trigger local event and notification
        this.triggerEvent('new_order', orderData);
        this.triggerEvent('new_notification', {
          _id: `order-${orderData._id}-${Date.now()}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${orderData.orderNumber}${orderData.tableNumber ? ` from Table ${orderData.tableNumber}` : ''}`,
          priority: 'medium',
          data: { 
            orderId: orderData._id,
            orderNumber: orderData.orderNumber,
            tableNumber: orderData.tableNumber 
          },
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending new order event:', error);
    }
  }

  // Utility Methods
  isConnected(): boolean {
    // In polling mode, we're "connected" if initialized
    const connected = this.isInitialized;
    return connected;
  }

  getConnectionId(): string | undefined {
    return this.isInitialized ? 'polling-mode' : undefined;
  }

  disconnect() {
    console.log('🔌 Disconnecting from notification system');
    this.eventListeners.clear();
  }

  // Debug method
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      socketConnected: this.isInitialized,
      socketId: this.isInitialized ? 'polling-mode' : undefined,
      restaurantId: this.restaurantId,
      mode: 'polling',
      eventListeners: Array.from(this.eventListeners.keys())
    };
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// Export types for use in components
export type { OrderUpdate, NewOrderData, NotificationData };