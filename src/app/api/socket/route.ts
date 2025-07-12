
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// In-memory store for demonstration (use Redis in production)
const activeConnections = new Map();
const notifications = new Map();

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Socket status check requested');
    
    return NextResponse.json({
      success: true,
      message: 'Socket server status',
      data: {
        isRunning: true,
        connectedClients: activeConnections.size,
        serverTime: new Date().toISOString(),
        status: 'operational'
      }
    });
  } catch (error) {
    console.error('❌ Socket status error:', error);
    return NextResponse.json(
      { success: false, message: 'Socket server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    console.log('📡 Socket API action:', action, data);

    switch (action) {
      case 'connect':
        const { restaurantId, clientId } = data;
        activeConnections.set(clientId, {
          restaurantId,
          connectedAt: new Date(),
          lastSeen: new Date()
        });
        
        console.log(`✅ Client ${clientId} connected to restaurant ${restaurantId}`);
        
        return NextResponse.json({
          success: true,
          message: 'Client connected',
          data: { clientId, restaurantId, status: 'connected' }
        });

      case 'disconnect':
        const { clientId: disconnectClientId } = data;
        activeConnections.delete(disconnectClientId);
        
        console.log(`🔌 Client ${disconnectClientId} disconnected`);
        
        return NextResponse.json({
          success: true,
          message: 'Client disconnected'
        });

      case 'heartbeat':
        const { clientId: heartbeatClientId } = data;
        if (activeConnections.has(heartbeatClientId)) {
          const connection = activeConnections.get(heartbeatClientId);
          connection.lastSeen = new Date();
          activeConnections.set(heartbeatClientId, connection);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Heartbeat received',
          timestamp: new Date().toISOString()
        });

      case 'broadcast_notification':
        const { restaurantId: notifyRestaurantId, notification } = data;
        
        // Store notification (in production, save to database)
        const notificationId = `${notifyRestaurantId}-${Date.now()}`;
        notifications.set(notificationId, {
          ...notification,
          restaurantId: notifyRestaurantId,
          createdAt: new Date()
        });
        
        console.log(`📨 Notification broadcast to restaurant ${notifyRestaurantId}:`, notification.title);
        
        return NextResponse.json({
          success: true,
          message: 'Notification broadcast',
          notificationId
        });

      case 'get_status':
        const { restaurantId: statusRestaurantId } = data;
        const restaurantConnections = Array.from(activeConnections.entries())
          .filter(([_, conn]) => conn.restaurantId === statusRestaurantId);
        
        return NextResponse.json({
          success: true,
          data: {
            restaurantId: statusRestaurantId,
            connectedClients: restaurantConnections.length,
            connections: restaurantConnections.map(([clientId, conn]) => ({
              clientId,
              connectedAt: conn.connectedAt,
              lastSeen: conn.lastSeen
            }))
          }
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Socket API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup old connections (called periodically)
setInterval(() => {
  const now = new Date();
  const timeoutMs = 60000; // 1 minute timeout
  
  for (const [clientId, connection] of activeConnections.entries()) {
    if (now.getTime() - connection.lastSeen.getTime() > timeoutMs) {
      console.log(`🧹 Cleaning up stale connection: ${clientId}`);
      activeConnections.delete(clientId);
    }
  }
}, 30000); // Check every 30 seconds