import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';

export interface User {
  _id: string;
  name: string;
  email: string;
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
  hourlyRate?: number;
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

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery';
  restaurantId?: string;
  permissions?: string[];
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  isActive?: boolean;
  hourlyRate?: number;
  hireDate?: string;
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
  performanceMetrics?: {
    ordersProcessed?: number;
    averageOrderTime?: number;
    customerRating?: number;
    punctuality?: number;
  };
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  restaurantId?: string;
  page?: number;
  limit?: number;
}

export function useUsers(filters?: UserFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.role && filters.role !== 'all') queryParams.set('role', filters.role);
  if (filters?.status && filters.status !== 'all') queryParams.set('status', filters.status);
  if (filters?.restaurantId) queryParams.set('restaurantId', filters.restaurantId);
  if (filters?.page) queryParams.set('page', filters.page.toString());
  if (filters?.limit) queryParams.set('limit', filters.limit.toString());

  const {
    data: response,
    loading,
    error,
    refetch,
  } = useApi<{ users: User[]; pagination: any }>(
    `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );

  return {
    users: response?.users || [],
    pagination: response?.pagination,
    loading,
    error,
    refetch,
  };
}

export function useUserOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createUserMutation } = useApiMutation<CreateUserInput, User>(
    '/api/users',
    'POST'
  );

  const { mutate: updateUserMutation } = useApiMutation<UpdateUserInput, User>(
    '/api/users',
    'PATCH'
  );

  const { mutate: deleteUserMutation } = useApiMutation(
    '/api/users',
    'DELETE'
  );

  const { mutate: updatePermissionsMutation } = useApiMutation<{ permissions: string[] }, User>(
    '/api/users/permissions',
    'PATCH'
  );

  const createUser = useCallback(async (data: CreateUserInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createUserMutation(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createUserMutation]);

  const updateUser = useCallback(async (id: string, data: UpdateUserInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateUserMutation({ ...data, _id: id });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUserMutation]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUserMutation({ _id: id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteUserMutation]);

  const updatePermissions = useCallback(async (id: string, permissions: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updatePermissionsMutation({ permissions, _id: id });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permissions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updatePermissionsMutation]);

  return {
    createUser,
    updateUser,
    deleteUser,
    updatePermissions,
    loading,
    error,
  };
}

export function useUser(id: string) {
  const {
    data: user,
    loading,
    error,
    refetch,
  } = useApi<User>(`/api/users/${id}`, { immediate: !!id });

  return {
    user,
    loading,
    error,
    refetch,
  };
}