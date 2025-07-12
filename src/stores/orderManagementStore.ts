// src/stores/orderManagementStore.ts
import { create } from 'zustand';
import { IOrder } from '@/models/Order';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averagePreparationTime: number;
  completionRate: number;
  peakHours: { hour: number; count: number }[];
}

interface OrderFilters {
  status: string[];
  orderType: string[];
  dateRange: { from: Date | null; to: Date | null };
  amountRange: { min: number | null; max: number | null };
  tableNumber: string;
  customerName: string;
  preparationTime: string;
}

interface OrderManagementState {
  orders: IOrder[];
  filteredOrders: IOrder[];
  selectedOrder: IOrder | null;
  stats: OrderStats;
  filters: OrderFilters;
  isLoading: boolean;
  
  setOrders: (orders: IOrder[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedOrder: (order: IOrder | null) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
}

export const useOrderManagementStore = create<OrderManagementState>((set, get) => ({
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    averagePreparationTime: 0,
    completionRate: 0,
    peakHours: [],
  },
  filters: {
    status: [],
    orderType: [],
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    tableNumber: '',
    customerName: '',
    preparationTime: '',
  },
  isLoading: false,
  
  setOrders: (orders) => {
    const stats = calculateOrderStats(orders);
    set({ orders, filteredOrders: orders, stats });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  
  updateFilter: (key, value) => {
    const newFilters = { ...get().filters, [key]: value };
    const filteredOrders = applyFilters(get().orders, newFilters);
    set({ filters: newFilters, filteredOrders });
  },
  
  clearFilters: () => {
    const defaultFilters: OrderFilters = {
      status: [],
      orderType: [],
      dateRange: { from: null, to: null },
      amountRange: { min: null, max: null },
      tableNumber: '',
      customerName: '',
      preparationTime: '',
    };
    set({ filters: defaultFilters, filteredOrders: get().orders });
  },
}));

function calculateOrderStats(orders: IOrder[]): OrderStats {
  // Implementation for calculating stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  
  const averageOrderValue = totalRevenue / (completedOrders || 1);
  
  return {
    totalOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    averageOrderValue,
    averagePreparationTime: 18, // Calculate from timestamps
    completionRate: (completedOrders / totalOrders) * 100,
    peakHours: [], // Calculate from order timestamps
  };
}

function applyFilters(orders: IOrder[], filters: OrderFilters): IOrder[] {
  return orders.filter(order => {
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(order.status)) {
      return false;
    }
    
    // Order type filter
    if (filters.orderType.length > 0 && !filters.orderType.includes(order.orderType)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const orderDate = new Date(order.createdAt);
      if (filters.dateRange.from && orderDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && orderDate > filters.dateRange.to) return false;
    }
    
    // Amount range filter
    if (filters.amountRange.min !== null && order.total < filters.amountRange.min) {
      return false;
    }
    if (filters.amountRange.max !== null && order.total > filters.amountRange.max) {
      return false;
    }
    
    // Table number filter
    if (filters.tableNumber && !order.tableNumber?.includes(filters.tableNumber)) {
      return false;
    }
    
    // Customer name filter
    if (filters.customerName && !order.customerInfo?.name?.toLowerCase().includes(filters.customerName.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}