import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    return NextResponse.json({
      success: true,
      data: {
        hasToken: !!token,
        userId: token?.sub,
        restaurantId: token?.restaurantId,
        role: token?.role,
        permissions: token?.permissions,
        name: token?.name,
        email: token?.email,
        hasRestaurantId: !!token?.restaurantId,
        hasPermissions: !!(token?.permissions && Array.isArray(token.permissions) && token.permissions.length > 0),
      },
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get session info' },
      { status: 500 }
    );
  }
}