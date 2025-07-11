// src/hooks/useOrderManagement.ts
import { useEffect } from 'react';
import { useApi, useApiMutation } from './useApi';
import { useOrderManagementStore } from '@/stores/orderManagementStore';
import { IOrder } from '@/models/Order';

interface OrdersApiResponse {
  orders: IOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useOrderManagement() {
  const orderManagementStore = useOrderManagementStore();
  
  const { data: ordersData, loading, refetch } = useApi<OrdersApiResponse>('/api/orders');
  
  const { mutate: updateOrderStatus, loading: updatingStatus } = useApiMutation('/api/orders/status', 'PATCH');
  const { mutate: cancelOrder, loading: cancelling } = useApiMutation('/api/orders/cancel', 'PATCH');
  const { mutate: refundOrder, loading: refunding } = useApiMutation('/api/orders/refund', 'POST');
  const { mutate: updateOrderDetails, loading: updating } = useApiMutation('/api/orders', 'PATCH');

  useEffect(() => {
    if (ordersData) {
      orderManagementStore.setOrders(ordersData.orders);
    }
    orderManagementStore.setLoading(loading);
  }, [ordersData, loading]);

  const handleStatusUpdate = async (orderId: string, status: string, notes?: string) => {
    const result = await updateOrderStatus({ 
      orderId, 
      status,
      notes 
    });
    
    if (result) {
      await refetch();
      return result;
    }
    return null;
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    const result = await cancelOrder({ 
      orderId, 
      reason,
      cancelledAt: new Date().toISOString()
    });
    
    if (result) {
      await refetch();
      return result;
    }
    return null;
  };

  const handleRefundOrder = async (orderId: string, amount: number, reason: string) => {
    const result = await refundOrder({ 
      orderId, 
      amount,
      reason 
    });
    
    if (result) {
      await refetch();
      return result;
    }
    return null;
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<IOrder>) => {
    const result = await updateOrderDetails({ 
      orderId, 
      ...updates 
    });
    
    if (result) {
      await refetch();
      return result;
    }
    return null;
  };

  const getOrderById = (orderId: string) => {
    return orderManagementStore.orders.find(order => order._id === orderId);
  };

  const getOrdersByStatus = (status: string) => {
    return orderManagementStore.orders.filter(order => order.status === status);
  };

  const getOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return orderManagementStore.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  return {
    // Data
    orders: orderManagementStore.orders,
    filteredOrders: orderManagementStore.filteredOrders,
    selectedOrder: orderManagementStore.selectedOrder,
    stats: orderManagementStore.stats,
    filters: orderManagementStore.filters,
    isLoading: orderManagementStore.isLoading,
    
    // Loading states
    updatingStatus,
    cancelling,
    refunding,
    updating,
    
    // Actions
    setSelectedOrder: orderManagementStore.setSelectedOrder,
    updateFilter: orderManagementStore.updateFilter,
    clearFilters: orderManagementStore.clearFilters,
    
    // API actions
    handleStatusUpdate,
    handleCancelOrder,
    handleRefundOrder,
    handleUpdateOrder,
    refetchOrders: refetch,
    
    // Utility functions
    getOrderById,
    getOrdersByStatus,
    getOrdersByDateRange,
  };
}