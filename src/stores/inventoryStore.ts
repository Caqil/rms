import { create } from 'zustand';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  reorderLevel: number;
  expirationDate?: Date;
  supplierInfo: {
    name: string;
    contact: string;
  };
  isLowStock: boolean;
}

interface InventoryState {
  items: InventoryItem[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  lowStockItems: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  getFilteredItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  lowStockItems: [],
  
  setItems: (items) => {
    const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
    set({ items, lowStockItems });
  },
  
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateItemQuantity: (itemId, quantity) => {
    set((state) => {
      const updatedItems = state.items.map(item =>
        item._id === itemId ? { ...item, quantity, isLowStock: quantity <= item.reorderLevel } : item
      );
      const lowStockItems = updatedItems.filter(item => item.quantity <= item.reorderLevel);
      return { items: updatedItems, lowStockItems };
    });
  },
  
  getFilteredItems: () => {
    const { items, selectedCategory, searchQuery } = get();
    
    let filtered = [...items];
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  },
  
  getLowStockItems: () => {
    const { items } = get();
    return items.filter(item => item.quantity <= item.reorderLevel);
  },
}));
