import { useEffect } from 'react';
import { useTableStore } from '@/stores/tableStore';
import { useApi, useApiMutation } from './useApi';

export function useTables() {
  const tableStore = useTableStore();
  
  const { data: tablesData, loading, refetch } = useApi<{ tables: any[] }>('/api/tables');
  
  const { mutate: updateTableStatus } = useApiMutation<{ status: string }, any>(
    '/api/tables',
    'PATCH'
  );

  useEffect(() => {
    if (tablesData) {
      tableStore.setTables(tablesData.tables);
    }
    tableStore.setLoading(loading);
  }, [tablesData, loading]);

  const updateStatus = async (tableId: string, status: string) => {
    const result = await updateTableStatus({ status });
    if (result) {
      tableStore.updateTableStatus(tableId, status as any);
    }
  };

  return {
    ...tableStore,
    refetchTables: refetch,
    updateStatus,
  };
}