import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST-ALL] Running comprehensive tests for menu, inventory, and customer creation');
  
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    const results = {
      sessionInfo: {
        hasToken: !!token,
        userId: token?.sub,
        role: token?.role,
        restaurantId: token?.restaurantId,
        permissions: token?.permissions,
        hasRestaurantId: !!token?.restaurantId,
        hasPermissions: !!(token?.permissions && Array.isArray(token.permissions) && token.permissions.length > 0),
      },
      tests: {} as any,
    };

    console.log('🧪 [TEST-ALL] Session info:', results.sessionInfo);

    // Test menu creation
    try {
      console.log('🧪 [TEST-ALL] Testing menu creation...');
      const menuResponse = await fetch(`${request.nextUrl.origin}/api/debug/test-menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '',
        },
      });
      results.tests.menu = await menuResponse.json();
      console.log('🧪 [TEST-ALL] Menu test result:', results.tests.menu);
    } catch (error: any) {
      console.error('🧪 [TEST-ALL] Menu test failed:', error);
      results.tests.menu = { success: false, error: error.message };
    }

    // Test inventory creation
    try {
      console.log('🧪 [TEST-ALL] Testing inventory creation...');
      const inventoryResponse = await fetch(`${request.nextUrl.origin}/api/debug/test-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '',
        },
      });
      results.tests.inventory = await inventoryResponse.json();
      console.log('🧪 [TEST-ALL] Inventory test result:', results.tests.inventory);
    } catch (error: any) {
      console.error('🧪 [TEST-ALL] Inventory test failed:', error);
      results.tests.inventory = { success: false, error: error.message };
    }

    // Test customer creation
    try {
      console.log('🧪 [TEST-ALL] Testing customer creation...');
      const customerResponse = await fetch(`${request.nextUrl.origin}/api/debug/test-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '',
        },
      });
      results.tests.customer = await customerResponse.json();
      console.log('🧪 [TEST-ALL] Customer test result:', results.tests.customer);
    } catch (error: any) {
      console.error('🧪 [TEST-ALL] Customer test failed:', error);
      results.tests.customer = { success: false, error: error.message };
    }

    // Summary
    const summary = {
      totalTests: 3,
      passed: Object.values(results.tests).filter((test: any) => test.success && test.apiResponse?.success).length,
      failed: Object.values(results.tests).filter((test: any) => !test.success || !test.apiResponse?.success).length,
    };

    console.log('🧪 [TEST-ALL] Test summary:', summary);

    return NextResponse.json({
      success: true,
      message: 'All tests completed',
      results,
      summary,
    });
  } catch (error: any) {
    console.error('🧪 [TEST-ALL] Test suite error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test suite failed',
      error: error.message,
    }, { status: 500 });
  }
}