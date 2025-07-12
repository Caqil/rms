import { create } from 'zustand';
import { Table } from '@/types/table';

interface TableState {
  tables: Table[];
  isLoading: boolean;
  
  // Actions
  setTables: (tables: Table[]) => void;
  setLoading: (loading: boolean) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  getAvailableTables: () => Table[];
  getTablesBySection: (section: string) => Table[];
  getTableByNumber: (number: string) => Table | undefined;
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  isLoading: false,

  setTables: (tables) => set({ tables }),
  setLoading: (loading) => set({ isLoading: loading }),

  updateTableStatus: (tableId, status) => set(state => ({
    tables: state.tables.map(table =>
      table._id === tableId ? { ...table, status } : table
    )
  })),

  getAvailableTables: () => {
    return get().tables.filter(table => 
      table.status === 'available' && table.isActive
    );
  },

  getTablesBySection: (section) => {
    return get().tables.filter(table => 
      table.section === section && table.isActive
    );
  },

  getTableByNumber: (number) => {
    return get().tables.find(table => 
      table.number === number && table.isActive
    );
  },
}));