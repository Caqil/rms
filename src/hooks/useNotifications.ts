import { useApi } from './useApi';

export interface Notification {
  _id: string;
  type: 'order' | 'inventory' | 'kitchen' | 'system' | 'customer';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  createdAt: Date;
}

export function useNotifications() {
  // Poll notifications every 15 seconds
  const { data, loading, refetch } = useApi<{
    notifications: Notification[];
    unreadCount: number;
  }>('/api/notifications', {
    pollInterval: 15000 // Poll every 15 seconds for notifications
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading: loading,
    refetch,
  };
}