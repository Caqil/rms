import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasAnyPermission } from '../permissions';

export async function authMiddleware(
  request: NextRequest,
  requiredPermissions?: string[]
) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = token.permissions as string[] || [];
    const hasRequiredPermission = hasAnyPermission(userPermissions, requiredPermissions);

    if (!hasRequiredPermission) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  return null; // No error, continue
}