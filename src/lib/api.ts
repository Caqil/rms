// Simple API utilities that don't use React hooks
// These can be called from anywhere without hook restrictions

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<TData = any, TResponse = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    data?: TData;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  console.log(`🌐 [API] ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.data ? JSON.stringify(options.data) : undefined,
    });

    console.log(`🌐 [API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`🌐 [API] Error response:`, errorData);
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    const result: ApiResponse<TResponse> = await response.json();
    console.log(`🌐 [API] Success response:`, result);

    if (result.success) {
      return result.data || (result as TResponse);
    } else {
      throw new ApiError(result.message || 'Request failed', response.status, result);
    }
  } catch (err) {
    console.error('🌐 [API] Request failed:', err);
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Unknown error',
      0
    );
  }
}

// Specific API functions
export const api = {
  // Menu items
  createMenuItem: (data: any) => 
    apiRequest('/api/menu', { method: 'POST', data }),
  
  updateMenuItem: (itemId: string, data: any) => 
    apiRequest('/api/menu', { method: 'PATCH', data: { itemId, ...data } }),
  
  deleteMenuItem: (itemId: string) => 
    apiRequest('/api/menu', { method: 'DELETE', data: { itemId } }),

  // Inventory
  createInventoryItem: (data: any) => 
    apiRequest('/api/inventory', { method: 'POST', data }),
  
  updateInventoryItem: (itemId: string, data: any) => 
    apiRequest('/api/inventory', { method: 'PATCH', data: { itemId, ...data } }),
  
  deleteInventoryItem: (itemId: string) => 
    apiRequest('/api/inventory', { method: 'DELETE', data: { itemId } }),

  // Customers
  createCustomer: (data: any) => 
    apiRequest('/api/customers', { method: 'POST', data }),
  
  updateCustomer: (customerId: string, data: any) => 
    apiRequest('/api/customers', { method: 'PATCH', data: { _id: customerId, ...data } }),
  
  deleteCustomer: (customerId: string) => 
    apiRequest('/api/customers', { method: 'DELETE', data: { _id: customerId } }),
};