import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import Table from '@/models/Table';

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

    const tables = await Table.find({
      restaurantId: token.restaurantId,
      isActive: true
    }).sort({ section: 1, number: 1 });

    return NextResponse.json({
      success: true,
      data: { tables },
    });

  } catch (error) {
    console.error('Get tables error:', error);
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

    const userPermissions = (token.permissions as string[]) || [];
    if (!hasPermission(userPermissions, PERMISSIONS.RESTAURANT_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const tableData = {
      ...body,
      restaurantId: token.restaurantId,
    };

    await connectToDatabase();

    const table = new Table(tableData);
    await table.save();

    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      data: table,
    });

  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
