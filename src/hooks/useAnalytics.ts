import { useState, useCallback, useMemo } from 'react';
import { useApi } from './useApi';

export interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  avgOrderValue: number;
  aovGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  customerRetentionRate: number;
  avgOrdersPerCustomer: number;
  customerLifetimeValue: number;
  repeatPurchaseRate: number;
  revenueByCategory: Array<{ name: string; value: number }>;
  ordersByStatus: Array<{ name: string; count: number }>;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
  insights: Array<{ title: string; description: string; action?: string }>;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface OrderData {
  date: string;
  orders: number;
}

export interface CustomerData {
  date: string;
  newCustomers: number;
  returningCustomers: number;
}

export interface PerformanceMetrics {
  avgPrepTime: number;
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  peakHours: Array<{ hour: string; orders: number }>;
  topStaff: Array<{ name: string; orders: number; revenue: number }>;
}

export interface UseAnalyticsReturn {
  analytics: AnalyticsData;
  revenueData: RevenueData[];
  orderData: OrderData[];
  customerData: CustomerData[];
  performanceMetrics: PerformanceMetrics;
  isLoading: boolean;
  refetch: () => Promise<void>;
  exportData: (format: 'pdf' | 'excel' | 'csv', dateRange: { from: Date; to: Date }) => Promise<void>;
}

export function useAnalytics(fromDate: Date, toDate: Date): UseAnalyticsReturn {
  const [isExporting, setIsExporting] = useState(false);

  // Format dates for API
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
    return params.toString();
  }, [fromDate, toDate]);

  // Fetch analytics data
  const {
    data: analyticsResponse,
    loading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useApi<{
    analytics: AnalyticsData;
    revenueData: RevenueData[];
    orderData: OrderData[];
    customerData: CustomerData[];
    performanceMetrics: PerformanceMetrics;
  }>(`/api/analytics?${queryParams}`, { immediate: true });

  // Default empty data structures
  const defaultAnalytics: AnalyticsData = {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    orderGrowth: 0,
    avgOrderValue: 0,
    aovGrowth: 0,
    totalCustomers: 0,
    customerGrowth: 0,
    customerRetentionRate: 0,
    avgOrdersPerCustomer: 0,
    customerLifetimeValue: 0,
    repeatPurchaseRate: 0,
    revenueByCategory: [],
    ordersByStatus: [],
    topSellingItems: [],
    insights: []
  };

  const defaultPerformanceMetrics: PerformanceMetrics = {
    avgPrepTime: 0,
    onTimeDeliveryRate: 0,
    orderAccuracy: 0,
    peakHours: [],
    topStaff: []
  };

  const exportData = useCallback(async (format: 'pdf' | 'excel' | 'csv', dateRange: { from: Date; to: Date }) => {
    setIsExporting(true);
    try {
      const exportParams = new URLSearchParams({
        format,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      
      const response = await fetch(`/api/analytics/export?${exportParams}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format}-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    analytics: analyticsResponse?.analytics || defaultAnalytics,
    revenueData: analyticsResponse?.revenueData || [],
    orderData: analyticsResponse?.orderData || [],
    customerData: analyticsResponse?.customerData || [],
    performanceMetrics: analyticsResponse?.performanceMetrics || defaultPerformanceMetrics,
    isLoading: analyticsLoading || isExporting,
    refetch: refetchAnalytics,
    exportData,
  };
}