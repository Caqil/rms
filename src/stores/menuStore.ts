import { create } from 'zustand';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number; // Added missing cost property
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
  seasonalAvailability?: {
    startDate: Date;
    endDate: Date;
  };
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MenuState {
  items: MenuItem[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  setItems: (items: MenuItem[]) => void;
  setCategories: (categories: string[]) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredItems: () => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  
  setItems: (items) => set({ items }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  
  getFilteredItems: () => {
    const { items, selectedCategory, searchQuery } = get();
    
    let filtered = items.filter(item => item.availability);
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  },
}));

// Export MenuItem type for use in other components
export type { MenuItem };