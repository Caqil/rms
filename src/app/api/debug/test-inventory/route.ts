import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST-INVENTORY] Simple inventory item creation test started');
  
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Create a simple test inventory item
    const testInventoryData = {
      itemName: 'Test Inventory Item',
      category: 'Test Category',
      currentStock: 100,
      minStockLevel: 10,
      maxStockLevel: 500,
      unit: 'pieces',
      cost: 2.50,
      supplier: 'Test Supplier',
    };

    console.log('🧪 [TEST-INVENTORY] Sending test data to inventory API:', testInventoryData);

    // Call the actual inventory API
    const response = await fetch(`${request.nextUrl.origin}/api/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(testInventoryData),
    });

    const responseData = await response.json();
    console.log('🧪 [TEST-INVENTORY] Response from inventory API:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Test completed',
      testData: testInventoryData,
      apiResponse: responseData,
      statusCode: response.status,
    });
  } catch (error: any) {
    console.error('🧪 [TEST-INVENTORY] Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message,
    }, { status: 500 });
  }
}