import { create } from 'zustand';

interface KitchenOrderItem {
  _id: string; // Added missing _id property
  name: string;
  quantity: number;
  specialInstructions?: string;
  preparationTime: number;
  category: string; // Added missing category property
  allergens: string[]; // Added missing allergens property
}

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  items: KitchenOrderItem[]; // Updated to use the proper interface
  status: 'pending' | 'preparing' | 'ready';
  orderType: 'dine_in' | 'takeout' | 'delivery';
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamps: {
    ordered: Date;
    started?: Date;
    completed?: Date;
  };
}

interface KitchenState {
  orders: KitchenOrder[];
  activeOrders: KitchenOrder[];
  completedOrders: KitchenOrder[];
  isLoading: boolean;
  setOrders: (orders: KitchenOrder[]) => void;
  setLoading: (loading: boolean) => void;
  updateOrderStatus: (orderId: string, status: KitchenOrder['status']) => void;
  updateOrderPriority: (orderId: string, priority: KitchenOrder['priority']) => void;
  getOrdersByStatus: (status: KitchenOrder['status']) => KitchenOrder[];
  getOrdersByPriority: (priority: KitchenOrder['priority']) => KitchenOrder[];
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  orders: [],
  activeOrders: [],
  completedOrders: [],
  isLoading: false,
  
  setOrders: (orders) => {
    const activeOrders = orders.filter(order => ['pending', 'preparing'].includes(order.status));
    const completedOrders = orders.filter(order => order.status === 'ready');
    set({ orders, activeOrders, completedOrders });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const updatedOrders = state.orders.map(order => {
        if (order._id === orderId) {
          const updatedOrder = { ...order, status };
          if (status === 'preparing' && !order.timestamps.started) {
            updatedOrder.timestamps = { ...order.timestamps, started: new Date() };
          }
          if (status === 'ready' && !order.timestamps.completed) {
            updatedOrder.timestamps = { ...order.timestamps, completed: new Date() };
          }
          return updatedOrder;
        }
        return order;
      });
      
      const activeOrders = updatedOrders.filter(order => ['pending', 'preparing'].includes(order.status));
      const completedOrders = updatedOrders.filter(order => order.status === 'ready');
      
      return { orders: updatedOrders, activeOrders, completedOrders };
    });
  },
  
  updateOrderPriority: (orderId, priority) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order._id === orderId ? { ...order, priority } : order
      ),
    }));
  },
  
  getOrdersByStatus: (status) => {
    const { orders } = get();
    return orders.filter(order => order.status === status);
  },
  
  getOrdersByPriority: (priority) => {
    const { orders } = get();
    return orders.filter(order => order.priority === priority);
  },
}));

// Export the interfaces for use in other components
export type { KitchenOrder, KitchenOrderItem };