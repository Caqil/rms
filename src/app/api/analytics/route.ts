import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import MenuItem from '@/models/Menu';
import User from '@/models/User';
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
    if (!hasPermission(userPermissions, PERMISSIONS.ANALYTICS_READ)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromDate = new Date(searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const toDate = new Date(searchParams.get('to') || new Date());

    await connectToDatabase();

    const restaurantId = token.restaurantId;
    console.log('Analytics API - Token:', { 
      sub: token.sub, 
      restaurantId: token.restaurantId,
      permissions: token.permissions 
    });
    
    if (!restaurantId) {
      console.log('Analytics API - No restaurantId found in token');
      return NextResponse.json(
        { success: false, message: 'Restaurant ID not found in session' },
        { status: 400 }
      );
    }

    // Base query for the date range and restaurant
    const baseQuery = {
      restaurantId,
      createdAt: { $gte: fromDate, $lte: toDate },
      status: { $nin: ['cancelled'] }
    };

    // Calculate previous period for growth comparisons
    const periodLength = toDate.getTime() - fromDate.getTime();
    const previousFromDate = new Date(fromDate.getTime() - periodLength);
    const previousToDate = fromDate;

    const previousPeriodQuery = {
      restaurantId,
      createdAt: { $gte: previousFromDate, $lte: previousToDate },
      status: { $nin: ['cancelled'] }
    };

    // Aggregate analytics data
    console.log('Analytics API - Starting aggregations with restaurantId:', restaurantId);
    
    const [
      currentPeriodStats,
      previousPeriodStats,
      revenueByDay,
      ordersByDay,
      customersByDay,
      revenueByCategory,
      ordersByStatus,
      topSellingItems,
      peakHours,
      topStaff,
      customerMetrics
    ] = await Promise.all([
      // Current period stats
      Order.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
            uniqueCustomers: { $addToSet: '$customerId' }
          }
        }
      ]),

      // Previous period stats for growth calculation
      Order.aggregate([
        { $match: previousPeriodQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
            uniqueCustomers: { $addToSet: '$customerId' }
          }
        }
      ]),

      // Revenue by day
      Order.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Orders by day
      Order.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // New vs returning customers by day
      Order.aggregate([
        { $match: baseQuery },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newCustomers: {
              $sum: {
                $cond: [
                  { $lte: [{ $arrayElemAt: ['$customer.createdAt', 0] }, '$createdAt'] },
                  1,
                  0
                ]
              }
            },
            returningCustomers: {
              $sum: {
                $cond: [
                  { $gt: [{ $arrayElemAt: ['$customer.createdAt', 0] }, '$createdAt'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue by category
      Order.aggregate([
        { $match: baseQuery },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItemId',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' },
        {
          $group: {
            _id: '$menuItem.category',
            value: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { value: -1 } }
      ]),

      // Orders by status
      Order.aggregate([
        { $match: { restaurantId, createdAt: { $gte: fromDate, $lte: toDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Top selling items
      Order.aggregate([
        { $match: baseQuery },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItemId',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' },
        {
          $group: {
            _id: '$items.menuItemId',
            name: { $first: '$menuItem.name' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ]),

      // Peak hours
      Order.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top staff by performance
      Order.aggregate([
        { $match: baseQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'staffId',
            foreignField: '_id',
            as: 'staff'
          }
        },
        { $unwind: '$staff' },
        {
          $group: {
            _id: '$staffId',
            name: { $first: '$staff.name' },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),

      // Customer metrics
      Customer.aggregate([
        { $match: { restaurantId } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'customerId',
            as: 'orders',
            pipeline: [
              { $match: { status: { $nin: ['cancelled'] } } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            avgOrdersPerCustomer: { $avg: { $size: '$orders' } },
            customerLifetimeValue: {
              $avg: {
                $sum: {
                  $map: {
                    input: '$orders',
                    as: 'order',
                    in: '$$order.total'
                  }
                }
              }
            }
          }
        }
      ])
    ]);

    // Process the data
    const current = currentPeriodStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueCustomers: [] };
    const previous = previousPeriodStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueCustomers: [] };

    // Calculate growth percentages
    const revenueGrowth = previous.totalRevenue ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0;
    const orderGrowth = previous.totalOrders ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 : 0;
    const aovGrowth = previous.avgOrderValue ? ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100 : 0;
    const customerGrowth = previous.uniqueCustomers.length ? ((current.uniqueCustomers.length - previous.uniqueCustomers.length) / previous.uniqueCustomers.length) * 100 : 0;

    // Format revenue data for charts
    const revenueData = revenueByDay.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: item.revenue
    }));

    // Format order data for charts
    const orderData = ordersByDay.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: item.orders
    }));

    // Format customer data for charts
    const customerData = customersByDay.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      newCustomers: item.newCustomers,
      returningCustomers: item.returningCustomers
    }));

    // Format peak hours
    const peakHoursData = peakHours.map(item => ({
      hour: `${item._id}:00`,
      orders: item.orders
    }));

    // Calculate customer metrics
    const customerMetricsData = customerMetrics[0] || { totalCustomers: 0, avgOrdersPerCustomer: 0, customerLifetimeValue: 0 };
    const repeatCustomers = await Order.aggregate([
      { $match: { restaurantId, customerId: { $ne: null } } },
      { $group: { _id: '$customerId', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'repeatCustomers' }
    ]);
    
    const repeatPurchaseRate = customerMetricsData.totalCustomers > 0 
      ? ((repeatCustomers[0]?.repeatCustomers || 0) / customerMetricsData.totalCustomers) * 100 
      : 0;

    // Generate insights (basic examples - could be enhanced with ML)
    type Insight = {
      title: string;
      description: string;
      action?: string;
    };
    const insights: Insight[] = [];
    if (revenueGrowth > 10) {
      insights.push({
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${revenueGrowth.toFixed(1)}% compared to the previous period.`,
      });
    }
    if (orderGrowth < -5) {
      insights.push({
        title: 'Order Volume Decline',
        description: `Order volume decreased by ${Math.abs(orderGrowth).toFixed(1)}%. Consider promotional campaigns.`,
        action: 'Create Promotion'
      });
    }
    if (current.avgOrderValue > 50) {
      insights.push({
        title: 'High Average Order Value',
        description: `Your average order value of $${current.avgOrderValue.toFixed(2)} is performing well.`,
      });
    }

    const analytics = {
      totalRevenue: current.totalRevenue,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      totalOrders: current.totalOrders,
      orderGrowth: Number(orderGrowth.toFixed(1)),
      avgOrderValue: current.avgOrderValue,
      aovGrowth: Number(aovGrowth.toFixed(1)),
      totalCustomers: current.uniqueCustomers.length,
      customerGrowth: Number(customerGrowth.toFixed(1)),
      customerRetentionRate: Number(repeatPurchaseRate.toFixed(1)),
      avgOrdersPerCustomer: Number(customerMetricsData.avgOrdersPerCustomer.toFixed(1)),
      customerLifetimeValue: customerMetricsData.customerLifetimeValue,
      repeatPurchaseRate: Number(repeatPurchaseRate.toFixed(1)),
      revenueByCategory: revenueByCategory.map(item => ({ name: item._id, value: item.value })),
      ordersByStatus: ordersByStatus.map(item => ({ name: item._id, count: item.count })),
      topSellingItems,
      insights
    };

    const performanceMetrics = {
      avgPrepTime: 18.5, // This would need to be calculated from order timestamps
      onTimeDeliveryRate: 94.2, // This would need to be calculated from delivery data
      orderAccuracy: 97.8, // This would need to be calculated from feedback/returns
      peakHours: peakHoursData,
      topStaff
    };

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        revenueData,
        orderData,
        customerData,
        performanceMetrics
      }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}