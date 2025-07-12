import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/models/Customer';
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

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (token.restaurantId) {
      query.restaurantId = token.restaurantId;
    }

    // Fetch customers
    const customers = await Customer.find(query)
      .populate('orderHistory', 'total createdAt')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Name',
        'Email',
        'Phone',
        'City',
        'State',
        'Total Spent',
        'Loyalty Points',
        'Orders Count',
        'Last Visit',
        'Status',
        'Join Date'
      ];

      const csvRows = customers.map(customer => [
        customer.name || '',
        customer.email || '',
        customer.phone || '',
        customer.address?.city || '',
        customer.address?.state || '',
        customer.totalSpent.toFixed(2),
        customer.loyaltyPoints,
        customer.orderHistory.length,
        customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '',
        customer.isActive ? 'Active' : 'Inactive',
        new Date(customer.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (format === 'excel') {
      // For Excel format, return CSV with Excel content type
      const csvContent = generateCSVContent(customers);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.xls"`
        }
      });
    }

    if (format === 'pdf') {
      // For PDF format, return a simple text report
      const textContent = generateTextReport(customers);
      
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.txt"`
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Unsupported format' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Customer export error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSVContent(customers: any[]): string {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'City',
    'State',
    'Total Spent',
    'Loyalty Points',
    'Orders Count',
    'Last Visit',
    'Status',
    'Join Date'
  ];

  const rows = customers.map(customer => [
    customer.name || '',
    customer.email || '',
    customer.phone || '',
    customer.address?.city || '',
    customer.address?.state || '',
    customer.totalSpent.toFixed(2),
    customer.loyaltyPoints,
    customer.orderHistory.length,
    customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '',
    customer.isActive ? 'Active' : 'Inactive',
    new Date(customer.createdAt).toLocaleDateString()
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

function generateTextReport(customers: any[]): string {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return `
Customer Report
==============
Generated: ${new Date().toLocaleDateString()}

Summary:
- Total Customers: ${totalCustomers}
- Active Customers: ${activeCustomers}
- Total Revenue: $${totalSpent.toFixed(2)}
- Average Customer Value: $${avgSpent.toFixed(2)}

Customer Details:
${customers.map(customer => 
  `${customer.name} | ${customer.email || 'No email'} | $${customer.totalSpent.toFixed(2)} | ${customer.loyaltyPoints} pts | ${customer.isActive ? 'Active' : 'Inactive'}`
).join('\n')}
`;
}