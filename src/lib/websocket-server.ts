import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'url';

let io: SocketIOServer | null = null;
const restaurantClients = new Map<string, Set<string>>();

export function initializeWebSocketServer(server: HTTPServer) {
  if (io) {
    console.log('✅ Socket.IO server already initialized');
    return io;
  }

  console.log('🚀 Initializing Socket.IO server...');

  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // In production, restrict this to your domain
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-restaurant', (data) => {
      const { restaurantId, authToken } = data;
      
      if (!restaurantId) {
        socket.emit('error', { message: 'Restaurant ID required' });
        return;
      }

      // Join restaurant room
      socket.join(restaurantId);
      
      // Track client
      if (!restaurantClients.has(restaurantId)) {
        restaurantClients.set(restaurantId, new Set());
      }
      restaurantClients.get(restaurantId)!.add(socket.id);

      console.log(`✅ Client ${socket.id} joined restaurant ${restaurantId}`);
      
      socket.emit('restaurant-joined', { 
        restaurantId, 
        clientId: socket.id,
        status: 'connected'
      });

      // Broadcast to restaurant that a new client joined
      socket.to(restaurantId).emit('client-joined', {
        clientId: socket.id,
        totalClients: restaurantClients.get(restaurantId)?.size || 0
      });
    });

    // Handle order status updates
    socket.on('update_order_status', (data, callback) => {
      const { orderId, status, restaurantId } = data;
      
      console.log('📋 Broadcasting order update:', { orderId, status });
      
      // Broadcast to all clients in restaurant
      io!.to(restaurantId).emit('order_status_update', {
        orderId,
        status,
        timestamp: new Date(),
        updatedBy: socket.id
      });

      if (callback) callback({ success: true });
    });

    // Handle kitchen updates
    socket.on('kitchen_update', (data, callback) => {
      const { orderId, status, restaurantId } = data;
      
      console.log('👨‍🍳 Broadcasting kitchen update:', { orderId, status });
      
      io!.to(restaurantId).emit('kitchen_update', {
        orderId,
        status,
        timestamp: new Date()
      });

      if (callback) callback({ success: true });
    });

    // Handle new orders
    socket.on('new_order', (data, callback) => {
      const { order, restaurantId } = data;
      
      console.log('🆕 Broadcasting new order:', order.orderNumber);
      
      io!.to(restaurantId).emit('new_order', order);

      // Create notification
      const notification = {
        _id: `order-${order._id}-${Date.now()}`,
        type: 'order',
        title: 'New Order',
        message: `Order ${order.orderNumber} received`,
        priority: 'medium',
        data: order,
        timestamp: new Date()
      };

      io!.to(restaurantId).emit('new_notification', notification);

      if (callback) callback({ success: true });
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
      
      // Remove from tracking
      for (const [restaurantId, clients] of restaurantClients.entries()) {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            restaurantClients.delete(restaurantId);
          }
          break;
        }
      }
    });
  });

  console.log('✅ Socket.IO server initialized successfully');
  return io;
}

export function getSocketInstance() {
  return io;
}