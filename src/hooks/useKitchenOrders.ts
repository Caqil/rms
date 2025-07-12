
import { useEffect } from 'react';
import { useApi, useApiMutation } from './useApi';
import { useKitchenStore } from '@/stores/kitchenStore';

export function useKitchenOrders() {
  const store = useKitchenStore();
  
  // Use polling for real-time updates (every 10 seconds)
  const { data, loading, refetch } = useApi<{ orders: any[] }>('/api/kitchen/orders', {
    pollInterval: 10000 // Poll every 10 seconds for kitchen orders
  });
  
  const { mutate: updateStatus } = useApiMutation('/api/orders/status', 'PATCH');
  const { mutate: updatePriority } = useApiMutation('/api/kitchen/priority', 'PATCH');

  useEffect(() => {
    if (data) {
      store.setOrders(data.orders);
    }
    store.setLoading(loading);
  }, [data, loading]); // Fixed dependencies

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
    orders: store.orders,
    pendingOrders: store.orders.filter(o => ['pending', 'confirmed'].includes(o.status)),
    preparingOrders: store.orders.filter(o => o.status === 'preparing'),
    readyOrders: store.orders.filter(o => o.status === 'ready'),
    isLoading: store.isLoading,
    updateOrderStatus,
    updateOrderPriority,
    startPreparation,
    markReady,
    refetch,
  };
}
