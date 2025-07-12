import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

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
    if (!hasPermission(userPermissions, PERMISSIONS.SYSTEM_ADMIN)) {
      return NextResponse.json(
        { success: false, message: 'Only system administrators can modify permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { _id, permissions } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent modification of super_admin permissions by non-super_admin users
    if (user.role === 'super_admin' && token.sub !== _id) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify super admin permissions' },
        { status: 403 }
      );
    }

    // Validate permissions - ensure they exist in the PERMISSIONS object
    const validPermissions = Object.values(PERMISSIONS) as readonly string[];
    const invalidPermissions = permissions.filter((perm: string) => !validPermissions.includes(perm));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid permissions detected',
          errors: invalidPermissions 
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    ).select('-password').populate('restaurantId', 'name');

    return NextResponse.json({
      success: true,
      message: 'User permissions updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user permissions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}