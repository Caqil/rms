
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.KITCHEN_READ)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get active kitchen orders (not completed or cancelled)
    const orders = await Order.find({
      restaurantId: token.restaurantId,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    })
    .populate({
      path: 'items.menuItemId',
      select: 'name preparationTime category allergens'
    })
    .populate('customerId', 'name')
    .sort({ 
      priority: -1, // Urgent orders first
      'timestamps.ordered': 1 // Oldest orders first within same priority
    });

    // Transform orders for kitchen display
    const kitchenOrders = orders.map(order => {
      const estimatedTime = order.items.reduce((total, item) => {
        return total + (item.menuItemId?.preparationTime || 0) * item.quantity;
      }, 0);

      // Calculate target completion time
      const orderTime = new Date(order.timestamps.ordered);
      const targetCompletionTime = new Date(orderTime.getTime() + estimatedTime * 60000);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        customerName: order.customerId?.name || order.customerInfo?.name,
        items: order.items.map(item => ({
          _id: item._id,
          name: item.menuItemId?.name || 'Unknown Item',
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          preparationTime: item.menuItemId?.preparationTime || 0,
          category: item.menuItemId?.category || 'Unknown',
          allergens: item.menuItemId?.allergens || []
        })),
        status: order.status,
        orderType: order.orderType,
        priority: order.priority || 'normal',
        estimatedTime,
        actualStartTime: order.timestamps.preparing,
        targetCompletionTime,
        timestamps: order.timestamps
      };
    });

    return NextResponse.json({
      success: true,
      data: { orders: kitchenOrders },
    });
  } catch (error: any) {
    console.error('Get kitchen orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

