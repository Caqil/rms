import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  cuisine: string[];
  priceRange: 'budget' | 'mid' | 'upscale' | 'fine_dining';
  capacity: number;
  averageRating: number;
  totalReviews: number;
  features: string[];
  paymentMethods: string[];
  deliveryOptions: string[];
  taxRate: number;
  serviceChargeRate: number;
  currency: string;
  timezone: string;
  isActive: boolean;
  ownerId: string;
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantInput {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours?: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  cuisine: string[];
  priceRange: 'budget' | 'mid' | 'upscale' | 'fine_dining';
  capacity: number;
  features?: string[];
  paymentMethods?: string[];
  deliveryOptions?: string[];
  taxRate?: number;
  serviceChargeRate?: number;
  currency?: string;
  timezone?: string;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  isActive?: boolean;
}

export interface RestaurantFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export function useRestaurants(filters?: RestaurantFilters) {
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
  } = useApi<{ restaurants: Restaurant[]; pagination: any }>(
    `/api/restaurants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );

  return {
    restaurants: response?.restaurants || [],
    pagination: response?.pagination,
    loading,
    error,
    refetch,
  };
}

export function useRestaurantOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createRestaurantMutation } = useApiMutation<CreateRestaurantInput, Restaurant>(
    '/api/restaurants',
    'POST'
  );

  const createRestaurant = useCallback(async (data: CreateRestaurantInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createRestaurantMutation(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create restaurant';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createRestaurantMutation]);

  const updateRestaurant = useCallback(async (id: string, data: UpdateRestaurantInput) => {
    try {
      setLoading(true);
      setError(null);
      const { mutate } = useApiMutation<UpdateRestaurantInput, Restaurant>(
        `/api/restaurants/${id}`,
        'PATCH'
      );
      const result = await mutate(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update restaurant';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRestaurant = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { mutate } = useApiMutation(
        `/api/restaurants/${id}`,
        'DELETE'
      );
      await mutate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete restaurant';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    loading,
    error,
  };
}

export function useRestaurant(id: string) {
  const {
    data: restaurant,
    loading,
    error,
    refetch,
  } = useApi<Restaurant>(`/api/restaurants/${id}`, { immediate: !!id });

  return {
    restaurant,
    loading,
    error,
    refetch,
  };
}