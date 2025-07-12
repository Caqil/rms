import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { PERMISSIONS, hasPermission, ROLE_PERMISSIONS } from '@/lib/permissions';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['manager', 'cashier', 'kitchen_staff', 'server', 'delivery']),
  hourlyRate: z.number().min(0).optional(),
  hireDate: z.string().optional(),
  shiftSchedule: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).optional(),
  certifications: z.array(z.string()).optional(),
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
    if (!hasPermission(userPermissions, PERMISSIONS.USER_READ)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();

    // Build query
    const query: any = {};
    
    // Filter by restaurant - only show staff for the current restaurant
    if (token.restaurantId) {
      query.restaurantId = token.restaurantId;
    }
    
    // Exclude super_admin from staff list unless user is super_admin
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN)) {
      query.role = { $ne: 'super_admin' };
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
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const total = await User.countDocuments(query);
    const staff = await User.find(query)
      .select('-password') // Exclude password field
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        staff,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get staff error:', error);
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
    if (!hasPermission(userPermissions, PERMISSIONS.USER_CREATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createStaffSchema.parse(body);

    await connectToDatabase();

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[validatedData.role as keyof typeof ROLE_PERMISSIONS] || [];

    const staff = new User({
      ...validatedData,
      password: hashedPassword,
      permissions: rolePermissions,
      restaurantId: token.restaurantId,
      performanceMetrics: {
        ordersProcessed: 0,
        averageOrderTime: 0,
        customerRating: 0,
        punctuality: 100,
      },
      isActive: true,
    });

    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    // In a real app, you would send the temporary password via email
    console.log(`Temporary password for ${validatedData.email}: ${tempPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        ...staffResponse,
        tempPassword, // Only for development - remove in production
      },
    });
  } catch (error: any) {
    console.error('Create staff error:', error);

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
    if (!hasPermission(userPermissions, PERMISSIONS.USER_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if staff member exists
    const staff = await User.findById(_id);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check restaurant association for non-admin users
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN) && 
        staff.restaurantId?.toString() !== token.restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this staff member' },
        { status: 403 }
      );
    }

    // Update role permissions if role is changed
    if (updateData.role && updateData.role !== staff.role) {
      const rolePermissions = ROLE_PERMISSIONS[updateData.role as keyof typeof ROLE_PERMISSIONS] || [];
      updateData.permissions = rolePermissions;
    }

    const updatedStaff = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').populate('restaurantId', 'name');

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaff,
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
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
    if (!hasPermission(userPermissions, PERMISSIONS.USER_DELETE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if staff member exists
    const staff = await User.findById(_id);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check restaurant association for non-admin users
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN) && 
        staff.restaurantId?.toString() !== token.restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this staff member' },
        { status: 403 }
      );
    }

    // Prevent deletion of super_admin users
    if (staff.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete super admin users' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await User.findByIdAndUpdate(_id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}