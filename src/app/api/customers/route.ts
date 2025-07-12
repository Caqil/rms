import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/models/Customer';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  dateOfBirth: z.string().optional(),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()).optional(),
    spiceLevel: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
  }).optional(),
  marketingOptIn: z.boolean().optional(),
});

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
    if (!hasPermission(userPermissions, PERMISSIONS.CUSTOMER_READ)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();

    // Build query
    const query: any = {};
    
    // Filter by restaurant
    if (token.restaurantId) {
      query.restaurantId = token.restaurantId;
    }
    
    // Filter by search term
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'vip') {
        query.loyaltyPoints = { $gte: 1000 };
      }
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('orderHistory', 'total createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('👥 [CUSTOMER API] POST request started');
  
  try {
    const token = await getToken({ req: request });
    console.log('👥 [CUSTOMER API] Token retrieved:', {
      hasToken: !!token,
      userId: token?.sub,
      role: token?.role,
      restaurantId: token?.restaurantId,
      permissionsLength: Array.isArray(token?.permissions) ? token.permissions.length : 0
    });
    
    if (!token) {
      console.log('👥 [CUSTOMER API] ❌ No token found');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    console.log('👥 [CUSTOMER API] User permissions:', userPermissions);
    console.log('👥 [CUSTOMER API] Required permission:', PERMISSIONS.CUSTOMER_CREATE);
    
    const hasCreatePermission = hasPermission(userPermissions, PERMISSIONS.CUSTOMER_CREATE);
    console.log('👥 [CUSTOMER API] Has create permission:', hasCreatePermission);
    
    if (!hasCreatePermission) {
      console.log('👥 [CUSTOMER API] ❌ Insufficient permissions');
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions', debug: { userPermissions, required: PERMISSIONS.CUSTOMER_CREATE } },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('👥 [CUSTOMER API] Request body:', JSON.stringify(body, null, 2));
    
    console.log('👥 [CUSTOMER API] Checking restaurant ID:', { tokenRestaurantId: token.restaurantId });
    
    if (!token.restaurantId) {
      console.log('👥 [CUSTOMER API] ❌ No restaurant ID found');
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }
    
    console.log('👥 [CUSTOMER API] Validating data...');
    const validatedData = createCustomerSchema.parse(body);
    console.log('👥 [CUSTOMER API] ✅ Data validation passed');

    console.log('👥 [CUSTOMER API] Connecting to database...');
    await connectToDatabase();
    console.log('👥 [CUSTOMER API] ✅ Database connected');

    console.log('👥 [CUSTOMER API] Creating customer object...');
    const customer = new Customer({
      ...validatedData,
      restaurantId: token.restaurantId,
      orderHistory: [],
      preferences: {
        favoriteItems: [],
        dietaryRestrictions: validatedData.preferences?.dietaryRestrictions || [],
        spiceLevel: validatedData.preferences?.spiceLevel || 5,
        notes: validatedData.preferences?.notes || '',
      },
      loyaltyPoints: 0,
      totalSpent: 0,
      visitFrequency: 0,
      marketingOptIn: validatedData.marketingOptIn || false,
      isActive: true,
    });
    console.log('👥 [CUSTOMER API] Customer object created');

    console.log('👥 [CUSTOMER API] Saving customer...');
    await customer.save();
    console.log('👥 [CUSTOMER API] ✅ Customer saved:', customer._id);

    console.log('👥 [CUSTOMER API] ✅ SUCCESS - Customer created successfully');
    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error: any) {
    console.error('👥 [CUSTOMER API] ❌ ERROR:', error);
    console.error('👥 [CUSTOMER API] Error stack:', error.stack);

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
    if (!hasPermission(userPermissions, PERMISSIONS.CUSTOMER_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if customer exists and belongs to the user's restaurant
    const customer = await Customer.findById(_id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check restaurant association
    if (token.restaurantId && customer.restaurantId.toString() !== token.restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this customer' },
        { status: 403 }
      );
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('orderHistory', 'total createdAt');

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.error('Update customer error:', error);
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
    if (!hasPermission(userPermissions, PERMISSIONS.CUSTOMER_DELETE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if customer exists and belongs to the user's restaurant
    const customer = await Customer.findById(_id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check restaurant association
    if (token.restaurantId && customer.restaurantId.toString() !== token.restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this customer' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Customer.findByIdAndUpdate(_id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}