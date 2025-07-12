import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST-MENU] Simple menu item creation test started');
  
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Create a simple test menu item
    const testMenuData = {
      name: 'Test Menu Item',
      description: 'This is a test menu item created for debugging',
      category: 'Test Category',
      price: 10.99,
      cost: 5.50,
      availability: true,
      preparationTime: 15,
      allergens: ['test'],
      ingredients: [], // Empty ingredients array
    };

    console.log('🧪 [TEST-MENU] Sending test data to menu API:', testMenuData);

    // Call the actual menu API
    const response = await fetch(`${request.nextUrl.origin}/api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(testMenuData),
    });

    const responseData = await response.json();
    console.log('🧪 [TEST-MENU] Response from menu API:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Test completed',
      testData: testMenuData,
      apiResponse: responseData,
      statusCode: response.status,
    });
  } catch (error: any) {
    console.error('🧪 [TEST-MENU] Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message,
    }, { status: 500 });
  }
}