import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Table from '@/models/Table';

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tableId, status } = body;

    if (!tableId || !status) {
      return NextResponse.json(
        { success: false, message: 'Table ID and status are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const table = await Table.findOneAndUpdate(
      {
        _id: tableId,
        restaurantId: token.restaurantId,
      },
      { status },
      { new: true }
    );

    if (!table) {
      return NextResponse.json(
        { success: false, message: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Table status updated successfully',
      data: table,
    });

  } catch (error) {
    console.error('Update table status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}