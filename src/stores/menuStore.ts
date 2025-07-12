import { create } from 'zustand';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  image?: string;
  availability: boolean;
  preparationTime: number;
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  restaurantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuState {
  items: MenuItem[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  
  // Actions
  setItems: (items: MenuItem[]) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredItems: () => MenuItem[];
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  removeItem: (id: string) => void;
  getItemById: (id: string) => MenuItem | undefined;
  getItemsByCategory: (category: string) => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
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

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  addItem: (item) => set(state => ({
    items: [...state.items, item]
  })),

  updateItem: (id, updates) => set(state => ({
    items: state.items.map(item =>
      item._id === id ? { ...item, ...updates } : item
    )
  })),

  removeItem: (id) => set(state => ({
    items: state.items.filter(item => item._id !== id)
  })),

  getItemById: (id) => {
    return get().items.find(item => item._id === id);
  },

  getItemsByCategory: (category) => {
    return get().items.filter(item => 
      item.category === category && item.isActive
    );
  },
}));