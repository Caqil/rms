import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import Inventory from '@/models/Inventory';
import mongoose from 'mongoose';

// Stock Adjustment History Model
const StockAdjustmentSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['add', 'remove', 'set'], required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  adjustmentQuantity: { type: Number, required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const StockAdjustment = mongoose.models.StockAdjustment || mongoose.model('StockAdjustment', StockAdjustmentSchema);

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
    if (!hasPermission(userPermissions, PERMISSIONS.INVENTORY_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, type, quantity, reason, notes } = body;

    if (!itemId || !type || !quantity || !reason) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['add', 'remove', 'set'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid adjustment type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the current inventory item
    const inventoryItem = await Inventory.findOne({
      _id: itemId,
      restaurantId: token.restaurantId,
      isActive: true
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const previousQuantity = inventoryItem.quantity;
    let newQuantity: number;
    let adjustmentQuantity: number;

    // Calculate new quantity based on adjustment type
    switch (type) {
      case 'add':
        newQuantity = previousQuantity + quantity;
        adjustmentQuantity = quantity;
        break;
      case 'remove':
        newQuantity = Math.max(0, previousQuantity - quantity);
        adjustmentQuantity = -quantity;
        break;
      case 'set':
        newQuantity = quantity;
        adjustmentQuantity = quantity - previousQuantity;
        break;
      default:
        throw new Error('Invalid adjustment type');
    }

    // Update the inventory item
    const updatedItem = await Inventory.findByIdAndUpdate(
      itemId,
      { 
        quantity: newQuantity,
        lastUpdated: new Date()
      },
      { new: true }
    );

    // Create adjustment history record
    const adjustmentRecord = new StockAdjustment({
      inventoryItemId: itemId,
      restaurantId: token.restaurantId,
      staffId: token.sub,
      type,
      previousQuantity,
      newQuantity,
      adjustmentQuantity,
      reason,
      notes: notes || undefined
    });

    await adjustmentRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Stock adjustment completed successfully',
      data: {
        item: updatedItem,
        adjustment: adjustmentRecord
      },
    });
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get stock adjustment history
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
    const itemId = searchParams.get('itemId');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectToDatabase();

    const query: any = { restaurantId: token.restaurantId };
    if (itemId) {
      query.inventoryItemId = itemId;
    }

    const adjustments = await StockAdjustment.find(query)
      .populate('inventoryItemId', 'itemName')
      .populate('staffId', 'name')
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { adjustments },
    });
  } catch (error: any) {
    console.error('Get stock adjustments error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}