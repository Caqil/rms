import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';

export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery';
  permissions: string[];
  restaurantId?: string;
  shiftSchedule?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  hourlyRate: number;
  hireDate?: string;
  certifications?: string[];
  performanceMetrics?: {
    ordersProcessed: number;
    averageOrderTime: number;
    customerRating: number;
    punctuality: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  role: 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery';
  hourlyRate?: number;
  hireDate?: string;
  permissions?: string[];
  shiftSchedule?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  certifications?: string[];
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  isActive?: boolean;
  performanceMetrics?: {
    ordersProcessed?: number;
    averageOrderTime?: number;
    customerRating?: number;
    punctuality?: number;
  };
}

export interface StaffFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useStaff(filters?: StaffFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.role && filters.role !== 'all') queryParams.set('role', filters.role);
  if (filters?.status && filters.status !== 'all') queryParams.set('status', filters.status);
  if (filters?.page) queryParams.set('page', filters.page.toString());
  if (filters?.limit) queryParams.set('limit', filters.limit.toString());

  const {
    data: response,
    loading,
    error,
    refetch,
  } = useApi<{ staff: Staff[]; pagination: any }>(
    `/api/staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );

  return {
    staff: response?.staff || [],
    pagination: response?.pagination,
    loading,
    error,
    refetch,
  };
}

export function useStaffOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createStaffMutation } = useApiMutation<CreateStaffInput, Staff>(
    '/api/staff',
    'POST'
  );

  const { mutate: updateStaffMutation } = useApiMutation<UpdateStaffInput, Staff>(
    '/api/staff',
    'PATCH'
  );

  const { mutate: deleteStaffMutation } = useApiMutation(
    '/api/staff',
    'DELETE'
  );

  const createStaff = useCallback(async (data: CreateStaffInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createStaffMutation(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createStaffMutation]);

  const updateStaff = useCallback(async (id: string, data: UpdateStaffInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateStaffMutation({ ...data, _id: id });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateStaffMutation]);

  const deleteStaff = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteStaffMutation({ _id: id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteStaffMutation]);

  return {
    createStaff,
    updateStaff,
    deleteStaff,
    loading,
    error,
  };
}

export function useStaffMember(id: string) {
  const {
    data: staff,
    loading,
    error,
    refetch,
  } = useApi<Staff>(`/api/staff/${id}`, { immediate: !!id });

  return {
    staff,
    loading,
    error,
    refetch,
  };
}