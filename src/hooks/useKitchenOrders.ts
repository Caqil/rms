import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from './useApi';
import { useKitchenStore } from '@/stores/kitchenStore';

export function useKitchenOrders() {
  const kitchenStore = useKitchenStore();
  
  const { data: ordersData, loading, refetch } = useApi<{ orders: any[] }>('/api/kitchen/orders');
  
  const { mutate: updateStatus } = useApiMutation('/api/orders/status', 'PATCH');
  const { mutate: updatePriority } = useApiMutation('/api/kitchen/priority', 'PATCH');

  useEffect(() => {
    if (ordersData) {
      kitchenStore.setOrders(ordersData.orders);
    }
    kitchenStore.setLoading(loading);
  }, [ordersData, loading]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateStatus({ orderId, status });
    refetch();
  };

  const updateOrderPriority = async (orderId: string, priority: string) => {
    await updatePriority({ orderId, priority });
    refetch();
  };

  const startPreparation = async (orderId: string) => {
    await updateStatus({ 
      orderId, 
      status: 'preparing',
      actualStartTime: new Date().toISOString()
    });
    refetch();
  };

  const markReady = async (orderId: string) => {
    await updateStatus({ orderId, status: 'ready' });
    refetch();
  };

  return {
    orders: kitchenStore.orders,
    pendingOrders: kitchenStore.orders.filter(o => ['pending', 'confirmed'].includes(o.status)),
    preparingOrders: kitchenStore.orders.filter(o => o.status === 'preparing'),
    readyOrders: kitchenStore.orders.filter(o => o.status === 'ready'),
    isLoading: kitchenStore.isLoading,
    updateOrderStatus,
    updateOrderPriority,
    startPreparation,
    markReady,
    refetch,
  };
}
