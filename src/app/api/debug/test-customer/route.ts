import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST-CUSTOMER] Simple customer creation test started');
  
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Create a simple test customer
    const testCustomerData = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '123-456-7890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
      },
      preferences: {
        dietaryRestrictions: [],
        spiceLevel: 5,
        notes: 'Test customer for debugging',
      },
      marketingOptIn: true,
    };

    console.log('🧪 [TEST-CUSTOMER] Sending test data to customer API:', testCustomerData);

    // Call the actual customer API
    const response = await fetch(`${request.nextUrl.origin}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(testCustomerData),
    });

    const responseData = await response.json();
    console.log('🧪 [TEST-CUSTOMER] Response from customer API:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Test completed',
      testData: testCustomerData,
      apiResponse: responseData,
      statusCode: response.status,
    });
  } catch (error: any) {
    console.error('🧪 [TEST-CUSTOMER] Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message,
    }, { status: 500 });
  }
}