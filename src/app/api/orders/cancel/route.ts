
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
    const { orderId, reason, cancelledAt } = body;

    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, message: 'Order ID and cancellation reason are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (['completed', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel completed or already cancelled orders' },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: cancelledAt || new Date(),
          cancellationReason: reason,
          cancelledBy: token.sub,
          // Update payment status if payment was completed
          ...(order.paymentInfo.status === 'completed' && {
            'paymentInfo.status': 'refunded'
          })
        }
      },
      { new: true }
    )
    .populate('items.menuItemId', 'name preparationTime category')
    .populate('customerId', 'name email phone')
    .populate('staffId', 'name');

    // Log the cancellation for audit trail
    console.log(`Order ${order.orderNumber} cancelled by user ${token.sub}. Reason: ${reason}`);

    // TODO: Implement inventory restoration logic here
    // If items were already deducted from inventory, restore them

    // TODO: Implement refund processing logic here
    // If payment was processed, initiate refund

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}