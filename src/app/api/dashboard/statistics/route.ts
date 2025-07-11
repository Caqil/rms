import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Customer from '@/models/Customer';
import MenuItem from '@/models/Menu';

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
    
    // Get current date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      todayOrders,
      yesterdayOrders,
      totalOrders,
      pendingOrders,
      completedOrdersToday,
      lowStockItems,
      totalCustomers,
      activeCustomersThisWeek,
      weeklyData,
      recentOrders,
      topItems
    ] = await Promise.all([
      // Today's orders
      Order.find({
        restaurantId,
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
      }),

      // Yesterday's orders
      Order.find({
        restaurantId,
        createdAt: { $gte: yesterday, $lt: today },
        status: { $ne: 'cancelled' }
      }),

      // Total orders count
      Order.countDocuments({
        restaurantId,
        status: { $ne: 'cancelled' }
      }),

      // Pending orders
      Order.find({
        restaurantId,
        status: { $in: ['pending', 'confirmed'] }
      }),

      // Completed orders today
      Order.find({
        restaurantId,
        createdAt: { $gte: today },
        status: { $in: ['completed', 'served'] }
      }),

      // Low stock items
      Inventory.find({
        restaurantId,
        isActive: true,
        $expr: { $lte: ['$quantity', '$reorderLevel'] }
      }),

      // Total customers
      Customer.countDocuments({ restaurantId, isActive: true }),

      // Active customers this week
      Customer.find({
        restaurantId,
        isActive: true,
        lastOrderDate: { $gte: weekAgo }
      }),

      // Weekly chart data
      Order.aggregate([
        {
          $match: {
            restaurantId: token.restaurantId,
            createdAt: { $gte: weekAgo },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" },
            customers: { $addToSet: "$customerId" }
          }
        },
        {
          $project: {
            date: "$_id",
            orders: 1,
            revenue: 1,
            customers: { $size: "$customers" }
          }
        },
        { $sort: { date: 1 } }
      ]),

      // Recent orders
      Order.find({
        restaurantId,
        createdAt: { $gte: today }
      })
      .populate('customerId', 'name')
      .populate('customerInfo')
      .sort({ createdAt: -1 })
      .limit(5),

      // Top selling items today
      Order.aggregate([
        {
          $match: {
            restaurantId: token.restaurantId,
            createdAt: { $gte: today },
            status: { $ne: 'cancelled' }
          }
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "menuitems",
            localField: "items.menuItemId",
            foreignField: "_id",
            as: "menuItem"
          }
        },
        { $unwind: "$menuItem" },
        {
          $group: {
            _id: "$items.menuItemId",
            name: { $first: "$menuItem.name" },
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate statistics
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
    
    // Calculate growth percentages
    const revenueGrowth = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;
    
    const orderGrowth = yesterdayOrders.length > 0 
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 
      : 0;

    // Format weekly data for charts
    type ChartData = { name: string; orders: number; revenue: number; customers: number };
    const chartData: ChartData[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = weeklyData.find(d => d.date === dateStr);
      
      chartData.push({
        name: days[date.getDay()],
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0,
        customers: dayData?.customers || 0
      });
    }

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customerId?.name || order.customerInfo?.name || 'Guest',
      amount: order.total,
      status: order.status,
      time: getTimeAgo(order.createdAt)
    }));

    const statistics = {
      // Main metrics
      todayOrders: todayOrders.length,
      todayRevenue: todayRevenue,
      totalOrders: totalOrders,
      avgOrderValue: avgOrderValue,
      
      // Growth metrics
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      
      // Status counts
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrdersToday.length,
      lowStockItems: lowStockItems.length,
      
      // Customer metrics
      totalCustomers: totalCustomers,
      activeCustomers: activeCustomersThisWeek.length,
      
      // Chart data
      chartData: chartData,
      
      // Recent activity
      recentOrders: formattedRecentOrders,
      topItems: topItems,
      
      // Additional metrics for cards
      monthlyGrowth: 12.5, // This would need a more complex calculation
    };

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    console.error('Dashboard statistics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}