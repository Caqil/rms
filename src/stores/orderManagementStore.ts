import { create } from 'zustand';
import { IOrder } from '@/models/Order';

interface OrderManagementState {
  orders: IOrder[];
  isLoading: boolean;
  selectedTab: string;
  filters: {
    status?: string;
    orderType?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  
  // Actions
  setOrders: (orders: IOrder[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTab: (tab: string) => void;
  setFilters: (filters: any) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  getFilteredOrders: () => IOrder[];
}

export const useOrderManagementStore = create<OrderManagementState>((set, get) => ({
  orders: [],
  isLoading: false,
  selectedTab: 'all',
  filters: {},

  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setFilters: (filters) => set(state => ({ 
    filters: { ...state.filters, ...filters } 
  })),

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

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.orderType) {
      filtered = filtered.filter(order => order.orderType === filters.orderType);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filters.dateRange!.start && orderDate <= filters.dateRange!.end;
      });
    }

    return filtered;
  },
}));