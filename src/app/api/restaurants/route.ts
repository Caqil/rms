import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { z } from 'zod';

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  contactInfo: z.object({
    phone: z.string().min(1),
    email: z.string().email(),
    website: z.string().url().optional(),
  }),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    friday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string(), isClosed: z.boolean() }).optional(),
  }).optional(),
  cuisine: z.array(z.string()),
  priceRange: z.enum(['budget', 'mid', 'upscale', 'fine_dining']),
  capacity: z.number().min(1),
  features: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  deliveryOptions: z.array(z.string()).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  serviceChargeRate: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
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
    if (!hasPermission(userPermissions, PERMISSIONS.RESTAURANT_READ)) {
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
    
    // Filter by search term
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { cuisine: { $in: [searchRegex] } },
      ];
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    // For non-super admins, only show restaurants they own or are assigned to
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN)) {
      query.$or = [
        { ownerId: token.sub },
        { _id: token.restaurantId },
      ];
    }

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get restaurants error:', error);
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
    if (!hasPermission(userPermissions, PERMISSIONS.RESTAURANT_CREATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);

    await connectToDatabase();

    // Set default business hours if not provided
    const defaultBusinessHours = {
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '09:00', close: '22:00', isClosed: false },
      saturday: { open: '09:00', close: '22:00', isClosed: false },
      sunday: { open: '09:00', close: '22:00', isClosed: false },
    };

    const restaurant = new Restaurant({
      ...validatedData,
      businessHours: validatedData.businessHours || defaultBusinessHours,
      ownerId: token.sub,
      averageRating: 0,
      totalReviews: 0,
      staffCount: 0,
      isActive: true,
      features: validatedData.features || [],
      paymentMethods: validatedData.paymentMethods || ['cash', 'card'],
      deliveryOptions: validatedData.deliveryOptions || ['pickup'],
      taxRate: validatedData.taxRate || 8.5,
      serviceChargeRate: validatedData.serviceChargeRate || 0,
      currency: validatedData.currency || 'USD',
      timezone: validatedData.timezone || 'America/New_York',
    });

    await restaurant.save();

    const populatedRestaurant = await Restaurant.findById(restaurant._id)
      .populate('ownerId', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      data: populatedRestaurant,
    });
  } catch (error: any) {
    console.error('Create restaurant error:', error);

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
    if (!hasPermission(userPermissions, PERMISSIONS.RESTAURANT_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if restaurant exists and user has permission to update it
    const restaurant = await Restaurant.findById(_id);
    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin permissions
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN) && 
        restaurant.ownerId.toString() !== token.sub) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this restaurant' },
        { status: 403 }
      );
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant,
    });
  } catch (error: any) {
    console.error('Update restaurant error:', error);
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
    if (!hasPermission(userPermissions, PERMISSIONS.RESTAURANT_DELETE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if restaurant exists and user has permission to delete it
    const restaurant = await Restaurant.findById(_id);
    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin permissions
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN) && 
        restaurant.ownerId.toString() !== token.sub) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this restaurant' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Restaurant.findByIdAndUpdate(_id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete restaurant error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}