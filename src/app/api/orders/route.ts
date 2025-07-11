import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { createOrderSchema, paginationSchema } from '@/lib/validations';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { generateOrderNumber, calculateOrderTotal } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { page, limit, sortBy, sortOrder } = paginationSchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      sortBy: queryParams.sortBy || 'createdAt',
      sortOrder: queryParams.sortOrder || 'desc',
    });

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (token.restaurantId) query.restaurantId = token.restaurantId;
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.orderType) query.orderType = queryParams.orderType;
    if (queryParams.tableNumber) query.tableNumber = queryParams.tableNumber;
    if (queryParams.date) {
      const date = new Date(queryParams.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query.createdAt = {
        $gte: date,
        $lt: nextDay,
      };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name price')
      .populate('customerId', 'name email phone')
      .populate('staffId', 'name')
      .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.ORDER_CREATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Calculate totals
    const { subtotal, taxes, total } = calculateOrderTotal(
      body.items,
      0.08, // Default tax rate, should come from restaurant settings
      body.discounts?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0
    );

    const validatedData = createOrderSchema.parse({
      ...body,
      restaurantId: token.restaurantId || body.restaurantId,
      subtotal,
      taxes,
      total: total + (body.tips || 0),
    });

    await connectToDatabase();

    const order = new Order({
      ...validatedData,
      orderNumber: generateOrderNumber(),
      staffId: token.sub,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItemId', 'name price preparationTime')
      .populate('customerId', 'name email phone')
      .populate('staffId', 'name');

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error: any) {
    console.error('Create order error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}