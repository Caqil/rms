import { useApi } from './useApi';

export function useDashboard() {
  // Poll dashboard stats every 30 seconds
  const { data, loading, refetch } = useApi<any>('/api/dashboard/statistics', {
    pollInterval: 30000 // Poll every 30 seconds for dashboard
  });

  return {
    stats: data || {},
    isLoading: loading,
    refetch,
  };
}