import { create } from 'zustand';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  cost: number;
  supplier?: string;
  expirationDate?: string;
  location?: string;
  restaurantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryState {
  items: InventoryItem[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  
  // Actions
  setItems: (items: InventoryItem[]) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getExpiringItems: () => InventoryItem[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,

  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),

  getFilteredItems: () => {
    const { items, selectedCategory, searchQuery } = get();
    
    let filtered = items.filter(item => item.isActive);

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
    return get().items.filter(item => 
      item.isActive && item.currentStock <= item.minStockLevel
    );
  },

  getExpiringItems: () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return get().items.filter(item => {
      if (!item.isActive || !item.expirationDate) return false;
      
      const expiryDate = new Date(item.expirationDate);
      return expiryDate <= sevenDaysFromNow;
    });
  },
}));
