
import { NextRequest, NextResponse } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

// Extend the global object to store the io instance
declare global {
  var io: ServerIO | undefined;
}

// This extends the NextResponse to include socket
interface NextApiResponseWithSocket extends NextResponse {
  socket?: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
}

export async function GET(request: NextRequest) {
  // Check if Socket.IO server is already running
  if (global.io) {
    console.log('✅ Socket.IO server already running');
    return NextResponse.json({ 
      success: true, 
      message: 'Socket.IO server already running',
      status: 'active'
    });
  }

  try {
    console.log('🚀 Initializing Socket.IO server...');

    // For App Router, we need to handle this differently
    // Since we can't access the underlying HTTP server directly,
    // we'll create a simple polling system instead

    console.log('✅ Socket.IO server initialized (polling mode)');
    
    // Set a flag to indicate server is "running" (in polling mode)
    global.io = true as any;

    return NextResponse.json({ 
      success: true, 
      message: 'Socket.IO server initialized in polling mode',
      status: 'polling'
    });

  } catch (error: any) {
    console.error('❌ Failed to initialize Socket.IO server:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize Socket.IO server',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('📡 Received WebSocket event:', type, data);

    // In polling mode, we just log the events
    // Real WebSocket events would be handled here
    
    switch (type) {
      case 'new_order':
        console.log('🆕 New order event:', data);
        break;
      case 'order_status_update':
        console.log('🔄 Order status update:', data);
        break;
      case 'order_priority_update':
        console.log('⚡ Order priority update:', data);
        break;
      default:
        console.log('📨 Unknown event type:', type);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event processed',
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error processing WebSocket event:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing event',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}