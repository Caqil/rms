import { create } from 'zustand';
import { IOrder } from '@/models/Order';

interface OrderManagementState {
  orders: IOrder[];
  selectedOrder: IOrder | null;
  isLoading: boolean;
  selectedTab: string;
  filters: {
    status: string[];
    orderType: string[];
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
    amountRange: {
      min: number | null;
      max: number | null;
    };
    tableNumber: string;
    customerName: string;
    preparationTime: string;
  };
  
  // Actions
  setOrders: (orders: IOrder[]) => void;
  setSelectedOrder: (order: IOrder | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTab: (tab: string) => void;
  setFilters: (filters: any) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  getFilteredOrders: () => IOrder[];
  getStats: () => {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    averagePreparationTime: number;
    completionRate: number;
    peakHours: { hour: number; count: number }[];
  };
}

export const useOrderManagementStore = create<OrderManagementState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  selectedTab: 'all',
  filters: {
    status: [],
    orderType: [],
    dateRange: {
      from: null,
      to: null,
    },
    amountRange: {
      min: null,
      max: null,
    },
    tableNumber: '',
    customerName: '',
    preparationTime: '',
  },

  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setFilters: (filters) => set(state => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  updateFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  clearFilters: () => set({ 
    filters: {
      status: [],
      orderType: [],
      dateRange: {
        from: null,
        to: null,
      },
      amountRange: {
        min: null,
        max: null,
      },
      tableNumber: '',
      customerName: '',
      preparationTime: '',
    }
  }),

  updateOrderStatus: (orderId, status) => set(state => ({
    orders: state.orders.map(order => {
      if (order._id === orderId) {
        order.status = status as IOrder['status'];
      }
      return order;
    })
  })),

  getFilteredOrders: () => {
    const { orders, filters } = get();
    
    let filtered = orders;

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(order => filters.status.includes(order.status));
    }

    // Order type filter
    if (filters.orderType.length > 0) {
      filtered = filtered.filter(order => filters.orderType.includes(order.orderType));
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (filters.dateRange.from && orderDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && orderDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Amount range filter
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
      filtered = filtered.filter(order => {
        if (filters.amountRange.min !== null && order.total < filters.amountRange.min) return false;
        if (filters.amountRange.max !== null && order.total > filters.amountRange.max) return false;
        return true;
      });
    }

    // Table number filter
    if (filters.tableNumber) {
      filtered = filtered.filter(order => 
        order.tableNumber?.toLowerCase().includes(filters.tableNumber.toLowerCase())
      );
    }

    // Customer name filter
    if (filters.customerName) {
      filtered = filtered.filter(order => 
        order.customerInfo?.name?.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Preparation time filter
    if (filters.preparationTime) {
      // This would need actual preparation time data in the order
      // For now, we'll skip this filter
    }

    return filtered;
  },
  
  getStats: () => {
    const { orders } = get();
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = 0; // 'processing' is not a valid status in IOrder
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const readyOrders = orders.filter(o => o.status === 'ready').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalOrders = orders.length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    
    const completionRate = totalOrders > 0 
      ? (completedOrders / totalOrders) * 100 
      : 0;
    
    // Calculate average preparation time (mock data for now)
    const averagePreparationTime = 20; // minutes
    
    // Calculate peak hours (mock data for now)
    const peakHours: { hour: number; count: number }[] = [
      { hour: 12, count: 25 },
      { hour: 19, count: 30 }
    ];
    
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      averagePreparationTime,
      completionRate,
      peakHours
    };
  },
}));