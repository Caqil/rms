import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  dateOfBirth?: string;
  orderHistory: string[];
  preferences: {
    favoriteItems: string[];
    dietaryRestrictions: string[];
    spiceLevel?: number;
    notes?: string;
  };
  loyaltyPoints: number;
  totalSpent: number;
  visitFrequency: number;
  lastVisit?: string;
  marketingOptIn: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  dateOfBirth?: string;
  preferences?: {
    dietaryRestrictions?: string[];
    spiceLevel?: number;
    notes?: string;
  };
  marketingOptIn?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  loyaltyPoints?: number;
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'vip';
  page?: number;
  limit?: number;
}

export function useCustomers(filters?: CustomerFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.status && filters.status !== 'all') queryParams.set('status', filters.status);
  if (filters?.page) queryParams.set('page', filters.page.toString());
  if (filters?.limit) queryParams.set('limit', filters.limit.toString());

  const {
    data: response,
    loading,
    error,
    refetch,
  } = useApi<{ customers: Customer[]; pagination: any }>(
    `/api/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );

  return {
    customers: response?.customers || [],
    pagination: response?.pagination,
    loading,
    error,
    refetch,
  };
}

export function useCustomerOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createCustomerMutation } = useApiMutation<CreateCustomerInput, Customer>(
    '/api/customers',
    'POST'
  );

  const { mutate: updateCustomerMutation } = useApiMutation<UpdateCustomerInput, Customer>(
    '/api/customers',
    'PATCH'
  );

  const { mutate: deleteCustomerMutation } = useApiMutation(
    '/api/customers',
    'DELETE'
  );

  const createCustomer = useCallback(async (data: CreateCustomerInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createCustomerMutation(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createCustomerMutation]);

  const updateCustomer = useCallback(async (id: string, data: UpdateCustomerInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateCustomerMutation({ ...data, _id: id });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCustomerMutation]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCustomerMutation({ _id: id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteCustomerMutation]);

  const exportCustomers = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/customers/export?format=${format}`);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export customers';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    exportCustomers,
    loading,
    error,
  };
}

export function useCustomer(id: string) {
  const {
    data: customer,
    loading,
    error,
    refetch,
  } = useApi<Customer>(`/api/customers/${id}`, { immediate: !!id });

  return {
    customer,
    loading,
    error,
    refetch,
  };
}