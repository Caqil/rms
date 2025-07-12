import { create } from 'zustand';

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  status: string;
  items: any[];
  tableNumber?: string;
  customerName?: string;
  orderType: string;
  priority: string;
  estimatedTime?: number;
  actualTime?: number;
  kitchenNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface KitchenState {
  orders: KitchenOrder[];
  isLoading: boolean;
  selectedStation: string | null;
  
  // Actions
  setOrders: (orders: KitchenOrder[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedStation: (station: string | null) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  updateOrderPriority: (orderId: string, priority: string) => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  orders: [],
  isLoading: false,
  selectedStation: null,

  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedStation: (station) => set({ selectedStation: station }),

  updateOrderStatus: (orderId, status) => set(state => ({
    orders: state.orders.map(order =>
      order._id === orderId ? { ...order, status } : order
    )
  })),

  updateOrderPriority: (orderId, priority) => set(state => ({
    orders: state.orders.map(order =>
      order._id === orderId ? { ...order, priority } : order
    )
  })),
}));