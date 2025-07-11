import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const restaurantId = token.restaurantId;
    type Notification = {
      _id: string;
      type: 'order' | 'kitchen' | 'inventory';
      title: string;
      message: string;
      isRead: boolean;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      data: { orderId?: any; itemId?: any };
      createdAt: any;
    };

    const notifications: Notification[] = [];

    // Get recent orders (last 30 minutes)
    const recentOrders = await Order.find({
      restaurantId,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      status: 'pending'
    }).sort({ createdAt: -1 }).limit(5);

    // Get kitchen orders ready for pickup
    const readyOrders = await Order.find({
      restaurantId,
      status: 'ready'
    }).sort({ createdAt: -1 }).limit(3);

    // Get low stock items
    const lowStockItems = await Inventory.find({
      restaurantId,
      isActive: true,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).limit(5);

    // Create notifications for new orders
    recentOrders.forEach(order => {
      notifications.push({
        _id: `order-${order._id}`,
        type: 'order',
        title: 'New order received',
        message: `Order ${order.orderNumber}${order.tableNumber ? ` from Table ${order.tableNumber}` : ''}`,
        isRead: false,
        priority: 'medium',
        data: { orderId: order._id },
        createdAt: order.createdAt,
      });
    });

    // Create notifications for ready orders
    readyOrders.forEach(order => {
      notifications.push({
        _id: `ready-${order._id}`,
        type: 'kitchen',
        title: 'Order ready for pickup',
        message: `Order ${order.orderNumber} is ready`,
        isRead: false,
        priority: 'high',
        data: { orderId: order._id },
        createdAt: order.updatedAt,
      });
    });

    // Create notifications for low stock
    lowStockItems.forEach(item => {
      const urgency = item.quantity === 0 ? 'urgent' : 'high';
      notifications.push({
        _id: `stock-${item._id}`,
        type: 'inventory',
        title: item.quantity === 0 ? 'Out of stock' : 'Low stock alert',
        message: `${item.itemName} - ${item.quantity} ${item.unit} remaining`,
        isRead: false,
        priority: urgency,
        data: { itemId: item._id },
        createdAt: item.lastUpdated,
      });
    });

    // Sort notifications by priority and creation time
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 10), // Limit to 10 most recent
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}