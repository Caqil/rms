import { create } from 'zustand';

interface Table {
  _id: string;
  number: string;
  capacity: number;
  section?: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  reservationId?: string;
  estimatedDuration?: number;
}

interface TableState {
  tables: Table[];
  selectedTable: Table | null;
  isLoading: boolean;
  setTables: (tables: Table[]) => void;
  setSelectedTable: (table: Table | null) => void;
  setLoading: (loading: boolean) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  getAvailableTables: () => Table[];
  getTablesBySection: (section: string) => Table[];
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  selectedTable: null,
  isLoading: false,
  
  setTables: (tables) => set({ tables }),
  setSelectedTable: (selectedTable) => set({ selectedTable }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateTableStatus: (tableId, status) => {
    set((state) => ({
      tables: state.tables.map(table =>
        table._id === tableId ? { ...table, status } : table
      ),
    }));
  },
  
  getAvailableTables: () => {
    const { tables } = get();
    return tables.filter(table => table.status === 'available');
  },
  
  getTablesBySection: (section) => {
    const { tables } = get();
    return tables.filter(table => table.section === section);
  },
}));
