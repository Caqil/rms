import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.ORDER_CANCEL)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, reason } = body;

    await connectToDatabase();

    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        restaurantId: token.restaurantId,
        status: { $nin: ['completed', 'cancelled'] }
      },
      { 
        status: 'cancelled',
        'timestamps.cancelled': new Date(),
        cancellationReason: reason || 'Cancelled by staff'
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    // TODO: Handle refund processing if payment was completed
    // TODO: Update inventory if items were already prepared

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
