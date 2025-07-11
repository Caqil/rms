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
    if (!hasPermission(userPermissions, PERMISSIONS.ORDER_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, notes, actualStartTime } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'Order ID and status are required' },
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

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served'],
      served: ['completed'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Cannot change status from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update timestamps based on status
    const timestampUpdates: Record<string, string> = {};
    const currentTime = new Date();

    switch (status) {
      case 'confirmed':
        timestampUpdates['timestamps.confirmed'] = currentTime.toISOString();
        break;
      case 'preparing':
        timestampUpdates['timestamps.preparing'] = actualStartTime || currentTime.toISOString();
        break;
      case 'ready':
        timestampUpdates['timestamps.ready'] = currentTime.toISOString();
        break;
      case 'served':
        timestampUpdates['timestamps.served'] = currentTime.toISOString();
        break;
      case 'completed':
        timestampUpdates['timestamps.completed'] = currentTime.toISOString();
        break;
    }

    // Update the order
    const updateData: any = {
      status,
      ...timestampUpdates,
    };

    if (notes) {
      updateData.kitchenNotes = notes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    )
    .populate('items.menuItemId', 'name preparationTime category')
    .populate('customerId', 'name email phone')
    .populate('staffId', 'name');

    // Log the status change for audit trail
    console.log(`Order ${order.orderNumber} status changed from ${order.status} to ${status} by user ${token.sub}`);

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}