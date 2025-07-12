import { create } from 'zustand';

export interface KitchenOrder {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  items: Array<{
    _id: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
    preparationTime: number;
    category: string;
    allergens: string[];
  }>;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served";
  orderType: "dine_in" | "takeout" | "delivery";
  priority: "low" | "normal" | "high" | "urgent";
  estimatedTime: number;
  actualStartTime?: Date;
  targetCompletionTime?: Date;
  timestamps: {
    ordered: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
  };
  isRushing?: boolean;
}

interface KitchenState {
  orders: KitchenOrder[];
  isLoading: boolean;
  selectedStation: string | null;
  
  // Actions
  setOrders: (orders: KitchenOrder[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedStation: (station: string | null) => void;
  updateOrderStatus: (orderId: string, status: "pending" | "confirmed" | "preparing" | "ready" | "served") => void;
  updateOrderPriority: (orderId: string, priority: "low" | "normal" | "high" | "urgent") => void;
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