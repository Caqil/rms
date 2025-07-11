// src/stores/orderManagementStore.ts
import { create } from 'zustand';
import { IOrder } from '@/models/Order';

interface OrderFilters {
  status: string | null;
  orderType: string | null;
  dateRange: 'today' | 'week' | 'month' | 'custom' | null;
  customDateStart?: Date;
  customDateEnd?: Date;
  tableNumber?: string;
  searchQuery: string;
}

interface OrderManagementState {
  orders: IOrder[];
  filteredOrders: IOrder[];
  selectedOrder: IOrder | null;
  filters: OrderFilters;
  isLoading: boolean;
  
  // Stats
  stats: {
    todayOrders: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    todayRevenue: number;
    avgOrderValue: number;
  };
  
  // Actions
  setOrders: (orders: IOrder[]) => void;
  setSelectedOrder: (order: IOrder | null) => void;
  setLoading: (loading: boolean) => void;
  updateFilter: (key: keyof OrderFilters, value: any) => void;
  clearFilters: () => void;
  getFilteredOrders: () => IOrder[];
  calculateStats: () => void;
}

const initialFilters: OrderFilters = {
  status: null,
  orderType: null,
  dateRange: 'today',
  searchQuery: '',
};

export const useOrderManagementStore = create<OrderManagementState>((set, get) => ({
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  filters: initialFilters,
  isLoading: false,
  stats: {
    todayOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
  },
  
  setOrders: (orders) => {
    set({ orders });
    get().calculateStats();
    set({ filteredOrders: get().getFilteredOrders() });
  },
  
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    set({ filteredOrders: get().getFilteredOrders() });
  },
  
  clearFilters: () => {
    set({ filters: initialFilters });
    set({ filteredOrders: get().getFilteredOrders() });
  },
  
  getFilteredOrders: () => {
    const { orders, filters } = get();
    let filtered = [...orders];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    
    // Filter by order type
    if (filters.orderType && filters.orderType !== 'all') {
      filtered = filtered.filter(order => order.orderType === filters.orderType);
    }
    
    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filters.dateRange === 'today') {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= today
      );
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= weekAgo
      );
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= monthAgo
      );
    } else if (filters.dateRange === 'custom' && filters.customDateStart && filters.customDateEnd) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filters.customDateStart! && orderDate <= filters.customDateEnd!;
      });
    }
    
    // Filter by table number
    if (filters.tableNumber) {
      filtered = filtered.filter(order => 
        order.tableNumber?.toLowerCase().includes(filters.tableNumber!.toLowerCase())
      );
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerInfo?.name?.toLowerCase().includes(query) ||
        order.customerInfo?.phone?.includes(query) ||
        order.tableNumber?.toLowerCase().includes(query)
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return filtered;
  },
  
  calculateStats: () => {
    const { orders } = get();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= today && order.status !== 'cancelled'
    );
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
    
    const stats = {
      todayOrders: todayOrders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      preparingOrders: orders.filter(order => order.status === 'preparing').length,
      readyOrders: orders.filter(order => order.status === 'ready').length,
      completedOrders: orders.filter(order => ['completed', 'served'].includes(order.status)).length,
      cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      todayRevenue,
      avgOrderValue,
    };
    
    set({ stats });
  },
}));