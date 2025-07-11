import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

// Table model (add to models/Table.ts)
import mongoose, { Schema, Document } from 'mongoose';

interface ITable extends Document {
  _id: string;
  number: string;
  capacity: number;
  section?: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  reservationId?: string;
  estimatedDuration?: number;
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema({
  number: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1, max: 20 },
  section: { type: String },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  estimatedDuration: { type: Number }, // in minutes
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

TableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
TableSchema.index({ status: 1 });

const Table = mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);

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
  } catch (error: any) {
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

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.INVENTORY_CREATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    await connectToDatabase();

    const table = new Table({
      ...body,
      restaurantId: token.restaurantId,
    });

    await table.save();

    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      data: table,
    });
  } catch (error: any) {
    console.error('Create table error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');
    const body = await request.json();

    await connectToDatabase();

    const table = await Table.findOneAndUpdate(
      { 
        _id: tableId, 
        restaurantId: token.restaurantId 
      },
      body,
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
      message: 'Table updated successfully',
      data: table,
    });
  } catch (error: any) {
    console.error('Update table error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
