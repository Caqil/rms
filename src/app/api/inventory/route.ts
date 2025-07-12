import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Inventory from '@/models/Inventory';
import { createInventorySchema, updateInventorySchema } from '@/lib/validations';
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

    await connectToDatabase();

    const items = await Inventory.find({
      restaurantId: token.restaurantId,
      isActive: true
    }).sort({ category: 1, itemName: 1 });

    // Calculate total inventory value
    const totalValue = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

    // Get unique categories
    const categories = [...new Set(items.map(item => item.category))];

    return NextResponse.json({
      success: true,
      data: {
        items,
        categories,
        totalValue,
      },
    });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('📦 [INVENTORY API] POST request started');
  
  try {
    const token = await getToken({ req: request });
    console.log('📦 [INVENTORY API] Token retrieved:', {
      hasToken: !!token,
      userId: token?.sub,
      role: token?.role,
      restaurantId: token?.restaurantId,
      permissionsLength: Array.isArray(token?.permissions) ? token.permissions.length : 0
    });
    
    if (!token) {
      console.log('📦 [INVENTORY API] ❌ No token found');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    console.log('📦 [INVENTORY API] User permissions:', userPermissions);
    console.log('📦 [INVENTORY API] Required permission:', PERMISSIONS.INVENTORY_CREATE);
    
    const hasCreatePermission = hasPermission(userPermissions, PERMISSIONS.INVENTORY_CREATE);
    console.log('📦 [INVENTORY API] Has create permission:', hasCreatePermission);
    
    if (!hasCreatePermission) {
      console.log('📦 [INVENTORY API] ❌ Insufficient permissions');
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions', debug: { userPermissions, required: PERMISSIONS.INVENTORY_CREATE } },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📦 [INVENTORY API] Request body:', JSON.stringify(body, null, 2));
    
    console.log('📦 [INVENTORY API] Checking restaurant ID:', { tokenRestaurantId: token.restaurantId });
    
    if (!token.restaurantId) {
      console.log('📦 [INVENTORY API] ❌ No restaurant ID found');
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }
    
    const dataToValidate = {
      ...body,
      restaurantId: token.restaurantId,
    };
    console.log('📦 [INVENTORY API] Data to validate:', JSON.stringify(dataToValidate, null, 2));
    
    const validatedData = createInventorySchema.parse(dataToValidate);
    console.log('📦 [INVENTORY API] ✅ Data validation passed');

    console.log('📦 [INVENTORY API] Connecting to database...');
    await connectToDatabase();
    console.log('📦 [INVENTORY API] ✅ Database connected');

    console.log('📦 [INVENTORY API] Creating inventory item...');
    const inventoryItem = new Inventory(validatedData);
    await inventoryItem.save();
    console.log('📦 [INVENTORY API] ✅ Inventory item saved:', inventoryItem._id);

    console.log('📦 [INVENTORY API] ✅ SUCCESS - Inventory item created successfully');
    return NextResponse.json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventoryItem,
    });
  } catch (error: any) {
    console.error('📦 [INVENTORY API] ❌ ERROR:', error);
    console.error('📦 [INVENTORY API] Error stack:', error.stack);

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

export async function PATCH(request: NextRequest) {
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
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateInventorySchema.parse(updateData);

    await connectToDatabase();

    const inventoryItem = await Inventory.findOneAndUpdate(
      { 
        _id: itemId, 
        restaurantId: token.restaurantId,
        isActive: true 
      },
      validatedData,
      { new: true }
    );

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem,
    });
  } catch (error: any) {
    console.error('Update inventory item error:', error);

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

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.INVENTORY_DELETE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Soft delete by setting isActive to false
    const inventoryItem = await Inventory.findOneAndUpdate(
      { 
        _id: itemId, 
        restaurantId: token.restaurantId 
      },
      { isActive: false },
      { new: true }
    );

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete inventory item error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}