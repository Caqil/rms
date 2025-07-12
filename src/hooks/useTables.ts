import { useEffect } from 'react';
import { useTableStore } from '@/stores/tableStore';
import { useApi, useApiMutation } from './useApi';
import { Table } from '@/types/table';

interface TablesApiResponse {
  tables: Table[];
}

export function useTables() {
  const {
    tables,
    isLoading,
    setTables,
    setLoading,
    updateTableStatus,
    getAvailableTables,
    getTablesBySection,
    getTableByNumber,
  } = useTableStore();

  const { data: tablesData, loading, refetch } = useApi<TablesApiResponse>('/api/tables');
  const { mutate: updateTableStatusAPI } = useApiMutation('/api/tables/status', 'PATCH');

  useEffect(() => {
    if (tablesData) {
      setTables(tablesData.tables);
    }
    setLoading(loading);
  }, [tablesData, loading, setTables, setLoading]);

  const updateStatus = async (tableId: string, status: Table['status']) => {
    // Optimistic update
    updateTableStatus(tableId, status);
    
    try {
      await updateTableStatusAPI({ tableId, status });
      refetch();
    } catch (error) {
      // Revert on error
      refetch();
      throw error;
    }
  };

  return {
    tables,
    isLoading,
    availableTables: getAvailableTables(),
    updateStatus,
    getTablesBySection,
    getTableByNumber,
    refetch,
  };
}
