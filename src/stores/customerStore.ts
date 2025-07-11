import { create } from 'zustand';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitFrequency: number;
  lastVisit?: Date;
  preferences: {
    favoriteItems: string[];
    dietaryRestrictions: string[];
  };
}

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  searchQuery: string;
  isLoading: boolean;
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  getFilteredCustomers: () => Customer[];
  getTopCustomers: (limit?: number) => Customer[];
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  searchQuery: '',
  isLoading: false,
  
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateCustomer: (customerId, updates) => {
    set((state) => ({
      customers: state.customers.map(customer =>
        customer._id === customerId ? { ...customer, ...updates } : customer
      ),
    }));
  },
  
  getFilteredCustomers: () => {
    const { customers, searchQuery } = get();
    
    if (!searchQuery) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  },
  
  getTopCustomers: (limit = 10) => {
    const { customers } = get();
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  },
}));