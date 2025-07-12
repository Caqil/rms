import { create } from 'zustand';

export interface OrderItem {
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

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Discount {
  type: string;
  amount: number;
  description: string;
}

export interface CurrentOrder {
  items: OrderItem[];
  orderType: 'dine_in' | 'takeout' | 'delivery';
  tableNumber?: string;
  customerInfo?: CustomerInfo;
  subtotal: number;
  taxes: number;
  discounts: Discount[];
  tips: number;
  total: number;
  notes?: string;
}

interface OrderState {
  currentOrder: CurrentOrder;
  
  // Actions
  addItem: (item: Omit<OrderItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (menuItemId: string) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  updateItemInstructions: (menuItemId: string, instructions: string) => void;
  setOrderType: (orderType: CurrentOrder['orderType']) => void;
  setTableNumber: (tableNumber: string) => void;
  setCustomerInfo: (customerInfo: CustomerInfo) => void;
  addDiscount: (discount: Discount) => void;
  removeDiscount: (index: number) => void;
  setTips: (tips: number) => void;
  setNotes: (notes: string) => void;
  calculateTotals: (taxRate: number) => void;
  clearOrder: () => void;
}

const initialOrder: CurrentOrder = {
  items: [],
  orderType: 'dine_in',
  subtotal: 0,
  taxes: 0,
  discounts: [],
  tips: 0,
  total: 0,
};

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: initialOrder,

  addItem: (newItem) => {
    const { currentOrder } = get();
    const existingItemIndex = currentOrder.items.findIndex(
      item => item.menuItemId === newItem.menuItemId
    );

    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = currentOrder.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
          : item
      );
    } else {
      // Add new item
      updatedItems = [
        ...currentOrder.items,
        { ...newItem, quantity: newItem.quantity || 1 }
      ];
    }

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        subtotal,
        total: subtotal + currentOrder.taxes + currentOrder.tips - 
               currentOrder.discounts.reduce((sum, d) => sum + d.amount, 0),
      }
    });
  },

  removeItem: (menuItemId) => {
    const { currentOrder } = get();
    const updatedItems = currentOrder.items.filter(
      item => item.menuItemId !== menuItemId
    );

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        subtotal,
        total: subtotal + currentOrder.taxes + currentOrder.tips - 
               currentOrder.discounts.reduce((sum, d) => sum + d.amount, 0),
      }
    });
  },

  updateItemQuantity: (menuItemId, quantity) => {
    const { currentOrder } = get();
    const updatedItems = currentOrder.items.map(item =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        subtotal,
        total: subtotal + currentOrder.taxes + currentOrder.tips - 
               currentOrder.discounts.reduce((sum, d) => sum + d.amount, 0),
      }
    });
  },

  updateItemInstructions: (menuItemId, instructions) => {
    const { currentOrder } = get();
    const updatedItems = currentOrder.items.map(item =>
      item.menuItemId === menuItemId 
        ? { ...item, specialInstructions: instructions } 
        : item
    );

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
      }
    });
  },

  setOrderType: (orderType) => {
    const { currentOrder } = get();
    set({
      currentOrder: {
        ...currentOrder,
        orderType,
        // Clear table number if not dine-in
        tableNumber: orderType === 'dine_in' ? currentOrder.tableNumber : undefined,
      }
    });
  },

  setTableNumber: (tableNumber) => {
    const { currentOrder } = get();
    set({
      currentOrder: {
        ...currentOrder,
        tableNumber,
      }
    });
  },

  setCustomerInfo: (customerInfo) => {
    const { currentOrder } = get();
    set({
      currentOrder: {
        ...currentOrder,
        customerInfo,
      }
    });
  },

  addDiscount: (discount) => {
    const { currentOrder } = get();
    const updatedDiscounts = [...currentOrder.discounts, discount];
    const discountTotal = updatedDiscounts.reduce((sum, d) => sum + d.amount, 0);

    set({
      currentOrder: {
        ...currentOrder,
        discounts: updatedDiscounts,
        total: currentOrder.subtotal + currentOrder.taxes + currentOrder.tips - discountTotal,
      }
    });
  },

  removeDiscount: (index) => {
    const { currentOrder } = get();
    const updatedDiscounts = currentOrder.discounts.filter((_, i) => i !== index);
    const discountTotal = updatedDiscounts.reduce((sum, d) => sum + d.amount, 0);

    set({
      currentOrder: {
        ...currentOrder,
        discounts: updatedDiscounts,
        total: currentOrder.subtotal + currentOrder.taxes + currentOrder.tips - discountTotal,
      }
    });
  },

  setTips: (tips) => {
    const { currentOrder } = get();
    const discountTotal = currentOrder.discounts.reduce((sum, d) => sum + d.amount, 0);

    set({
      currentOrder: {
        ...currentOrder,
        tips,
        total: currentOrder.subtotal + currentOrder.taxes + tips - discountTotal,
      }
    });
  },

  setNotes: (notes) => {
    const { currentOrder } = get();
    set({
      currentOrder: {
        ...currentOrder,
        notes,
      }
    });
  },

  calculateTotals: (taxRate) => {
    const { currentOrder } = get();
    const { subtotal, discounts, tips } = currentOrder;
    
    const taxes = subtotal * taxRate;
    const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
    const total = subtotal + taxes + tips - discountTotal;

    set({
      currentOrder: {
        ...currentOrder,
        taxes,
        total: Math.max(0, total), // Ensure total is not negative
      }
    });
  },

  clearOrder: () => {
    set({ currentOrder: initialOrder });
  },
}));