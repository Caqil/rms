import { useApi } from './useApi';

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockItems: number;
  totalCustomers: number;
  activeCustomers: number;
  monthlyGrowth: number;
  chartData: Array<{
    name: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    time: string;
  }>;
  topItems: Array<{
    _id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export function useDashboard() {
  const { data: dashboardData, loading, refetch } = useApi<DashboardStats>('/api/dashboard/statistics');

  return {
    stats: dashboardData || {
      todayOrders: 0,
      todayRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      revenueGrowth: 0,
      orderGrowth: 0,
      pendingOrders: 0,
      completedOrders: 0,
      lowStockItems: 0,
      totalCustomers: 0,
      activeCustomers: 0,
      monthlyGrowth: 0,
      chartData: [],
      recentOrders: [],
      topItems: [],
    },
    isLoading: loading,
    refetch,
  };
}