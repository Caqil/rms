import { connectToDatabase } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import Order from "@/models/Order";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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
    if (!hasPermission(userPermissions, PERMISSIONS.KITCHEN_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, priority } = body;

    await connectToDatabase();

    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        restaurantId: token.restaurantId 
      },
      { priority },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // TODO: Emit real-time update via Socket.io
    // io.to(`restaurant_${token.restaurantId}`).emit('orderPriorityUpdate', { orderId, priority });

    return NextResponse.json({
      success: true,
      message: 'Order priority updated successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Update order priority error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}