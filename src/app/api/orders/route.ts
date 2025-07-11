// src/app/api/orders/route.ts (Updated)
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

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.ORDER_READ)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { page, limit, sortBy, sortOrder } = paginationSchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
      sortBy: queryParams.sortBy || 'createdAt',
      sortOrder: queryParams.sortOrder || 'desc',
    });

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (token.restaurantId) query.restaurantId = token.restaurantId;
    
    // Filter by status
    if (queryParams.status && queryParams.status !== 'all') {
      query.status = queryParams.status;
    }
    
    // Filter by order type
    if (queryParams.orderType && queryParams.orderType !== 'all') {
      query.orderType = queryParams.orderType;
    }
    
    // Filter by table number
    if (queryParams.tableNumber) {
      query.tableNumber = queryParams.tableNumber;
    }
    
    // Filter by date range
    if (queryParams.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (queryParams.dateRange) {
        case 'today':
          query.createdAt = { $gte: today };
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.createdAt = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          query.createdAt = { $gte: monthAgo };
          break;
        case 'custom':
          if (queryParams.startDate && queryParams.endDate) {
            query.createdAt = {
              $gte: new Date(queryParams.startDate),
              $lte: new Date(queryParams.endDate)
            };
          }
          break;
      }
    }
    
    // Search functionality
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customerInfo.name': searchRegex },
        { 'customerInfo.phone': searchRegex },
        { tableNumber: searchRegex }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate({
        path: 'items.menuItemId',
        select: 'name price preparationTime category'
      })
      .populate('customerId', 'name email phone')
      .populate('staffId', 'name')
      .sort({ [String(sortBy)]: sortOrder === 'asc' ? 1 : -1 })
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