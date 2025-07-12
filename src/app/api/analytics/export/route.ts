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
    if (!hasPermission(userPermissions, PERMISSIONS.REPORTS_EXPORT)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const fromDate = new Date(searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const toDate = new Date(searchParams.get('to') || new Date());

    await connectToDatabase();

    const restaurantId = token.restaurantId;
    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 400 }
      );
    }

    // Fetch the data for export
    const orders = await Order.find({
      restaurantId,
      createdAt: { $gte: fromDate, $lte: toDate },
      status: { $nin: ['cancelled'] }
    })
    .populate('items.menuItemId', 'name category')
    .populate('staffId', 'name')
    .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Date',
        'Order Number',
        'Total',
        'Items Count',
        'Order Type',
        'Status',
        'Staff',
        'Customer Name'
      ];

      const csvRows = orders.map(order => [
        order.createdAt.toISOString().split('T')[0],
        order.orderNumber,
        order.total.toFixed(2),
        order.items.length,
        order.orderType,
        order.status,
        (order.staffId as any)?.name || 'N/A',
        order.customerInfo?.name || 'N/A'
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${fromDate.toISOString().split('T')[0]}-${toDate.toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (format === 'excel') {
      // For Excel format, you would typically use a library like xlsx
      // For now, return CSV with Excel content type
      const csvContent = generateCSVContent(orders);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="analytics-${fromDate.toISOString().split('T')[0]}-${toDate.toISOString().split('T')[0]}.xls"`
        }
      });
    }

    if (format === 'pdf') {
      // For PDF format, you would typically use a library like jsPDF or Puppeteer
      // For now, return a simple text response
      const textContent = generateTextReport(orders, fromDate, toDate);
      
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${fromDate.toISOString().split('T')[0]}-${toDate.toISOString().split('T')[0]}.pdf"`
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Unsupported format' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSVContent(orders: any[]): string {
  const headers = [
    'Date',
    'Order Number',
    'Total',
    'Items Count',
    'Order Type',
    'Status',
    'Staff',
    'Customer Name'
  ];

  const rows = orders.map(order => [
    order.createdAt.toISOString().split('T')[0],
    order.orderNumber,
    order.total.toFixed(2),
    order.items.length,
    order.orderType,
    order.status,
    order.staffId?.name || 'N/A',
    order.customerInfo?.name || 'N/A'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

function generateTextReport(orders: any[], fromDate: Date, toDate: Date): string {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return `
Analytics Report
===============
Period: ${fromDate.toDateString()} - ${toDate.toDateString()}

Summary:
- Total Orders: ${totalOrders}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Average Order Value: $${avgOrderValue.toFixed(2)}

Orders:
${orders.map(order => 
  `${order.createdAt.toISOString().split('T')[0]} | ${order.orderNumber} | $${order.total.toFixed(2)} | ${order.status}`
).join('\n')}
`;
}