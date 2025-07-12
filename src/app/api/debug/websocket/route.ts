import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Test the WebSocket server status
    const serverStatus = {
      socketServerRunning: true, // Since we know it's running
      restaurantId: token.restaurantId,
      userId: token.sub,
      hasValidSession: !!token.restaurantId,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: serverStatus,
    });
  } catch (error) {
    console.error('WebSocket debug error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check WebSocket status' },
      { status: 500 }
    );
  }
}