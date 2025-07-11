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
  const { data: notificationsData, loading, refetch } = useApi<{
    notifications: Notification[];
    unreadCount: number;
  }>('/api/notifications');

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount: notificationsData?.unreadCount || 0,
    isLoading: loading,
    refetch,
  };
}