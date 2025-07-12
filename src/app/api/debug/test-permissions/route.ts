import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const userPermissions = (token.permissions as string[]) || [];
    
    const testResults = {
      hasMenuCreate: hasPermission(userPermissions, PERMISSIONS.MENU_CREATE),
      hasInventoryCreate: hasPermission(userPermissions, PERMISSIONS.INVENTORY_CREATE),
      hasCustomerCreate: hasPermission(userPermissions, PERMISSIONS.CUSTOMER_CREATE),
      userRole: token.role,
      userPermissions: userPermissions,
      hasRestaurantId: !!token.restaurantId,
      restaurantId: token.restaurantId,
      permissionChecks: {
        menuCreate: {
          required: PERMISSIONS.MENU_CREATE,
          hasPermission: hasPermission(userPermissions, PERMISSIONS.MENU_CREATE),
        },
        inventoryCreate: {
          required: PERMISSIONS.INVENTORY_CREATE,
          hasPermission: hasPermission(userPermissions, PERMISSIONS.INVENTORY_CREATE),
        },
        customerCreate: {
          required: PERMISSIONS.CUSTOMER_CREATE,
          hasPermission: hasPermission(userPermissions, PERMISSIONS.CUSTOMER_CREATE),
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: testResults,
    });
  } catch (error) {
    console.error('Permission test error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to test permissions' },
      { status: 500 }
    );
  }
}