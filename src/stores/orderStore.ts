import { create } from 'zustand';
import { calculateOrderTotal } from '@/lib/utils';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  modifications?: Array<{
    type: 'add' | 'remove' | 'substitute';
    item: string;
    price: number;
  }>;
}

interface Discount {
  type: string;
  amount: number;
  description: string;
}

interface OrderState {
  currentOrder: {
    items: OrderItem[];
    tableNumber?: string;
    customerInfo?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    orderType: 'dine_in' | 'takeout' | 'delivery';
    subtotal: number;
    taxes: number;
    discounts: Discount[];
    tips: number;
    total: number;
  };
  orders: any[];
  isLoading: boolean;
  addItem: (item: OrderItem) => void;
  removeItem: (menuItemId: string) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  updateItemInstructions: (menuItemId: string, instructions: string) => void;
  setTableNumber: (tableNumber: string) => void;
  setCustomerInfo: (customerInfo: any) => void;
  setOrderType: (orderType: 'dine_in' | 'takeout' | 'delivery') => void;
  addDiscount: (discount: Discount) => void;
  removeDiscount: (index: number) => void;
  setTips: (tips: number) => void;
  calculateTotals: (taxRate: number) => void;
  clearOrder: () => void;
  setOrders: (orders: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: {
    items: [],
    orderType: 'dine_in',
    subtotal: 0,
    taxes: 0,
    discounts: [],
    tips: 0,
    total: 0,
  },
  orders: [],
  isLoading: false,
  
  addItem: (item) => {
    set((state) => {
      const existingItemIndex = state.currentOrder.items.findIndex(
        (orderItem) => orderItem.menuItemId === item.menuItemId
      );
      
      if (existingItemIndex > -1) {
        const updatedItems = [...state.currentOrder.items];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return {
          currentOrder: {
            ...state.currentOrder,
            items: updatedItems,
          },
        };
      } else {
        return {
          currentOrder: {
            ...state.currentOrder,
            items: [...state.currentOrder.items, item],
          },
        };
      }
    });
    get().calculateTotals(0.08);
  },
  
  removeItem: (menuItemId) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.filter(item => item.menuItemId !== menuItemId),
      },
    }));
    get().calculateTotals(0.08);
  },
  
  updateItemQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.map(item =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        ),
      },
    }));
    get().calculateTotals(0.08);
  },
  
  updateItemInstructions: (menuItemId, instructions) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.map(item =>
          item.menuItemId === menuItemId ? { ...item, specialInstructions: instructions } : item
        ),
      },
    }));
  },
  
  setTableNumber: (tableNumber) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        tableNumber,
      },
    }));
  },
  
  setCustomerInfo: (customerInfo) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        customerInfo,
      },
    }));
  },
  
  setOrderType: (orderType) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        orderType,
      },
    }));
  },
  
  addDiscount: (discount) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        discounts: [...state.currentOrder.discounts, discount],
      },
    }));
    get().calculateTotals(0.08);
  },
  
  removeDiscount: (index) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        discounts: state.currentOrder.discounts.filter((_, i) => i !== index),
      },
    }));
    get().calculateTotals(0.08);
  },
  
  setTips: (tips) => {
    set((state) => ({
      currentOrder: {
        ...state.currentOrder,
        tips,
      },
    }));
  },
  
  calculateTotals: (taxRate) => {
    set((state) => {
      const discountAmount = state.currentOrder.discounts.reduce(
        (sum, discount) => sum + discount.amount, 0
      );
      
      const { subtotal, taxes, total } = calculateOrderTotal(
        state.currentOrder.items,
        taxRate,
        discountAmount
      );
      
      return {
        currentOrder: {
          ...state.currentOrder,
          subtotal,
          taxes,
          total: total + state.currentOrder.tips,
        },
      };
    });
  },
  
  clearOrder: () => {
    set({
      currentOrder: {
        items: [],
        orderType: 'dine_in',
        subtotal: 0,
        taxes: 0,
        discounts: [],
        tips: 0,
        total: 0,
      },
    });
  },
  
  setOrders: (orders) => set({ orders }),
  setLoading: (isLoading) => set({ isLoading }),
}));