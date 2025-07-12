import { useEffect } from 'react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useApi, useApiMutation } from './useApi';

export function useInventory() {
  const store = useInventoryStore();
  
  const { data, loading, refetch } = useApi<{
    items: any[];
    categories: string[];
    totalValue: number;
  }>('/api/inventory');

  const { mutate: createItem, loading: creating } = useApiMutation('/api/inventory', 'POST');
  const { mutate: updateItem, loading: updating } = useApiMutation('/api/inventory', 'PATCH');
  const { mutate: deleteItem } = useApiMutation('/api/inventory', 'DELETE');
  const { mutate: adjustStock } = useApiMutation('/api/inventory/adjust', 'POST');

  useEffect(() => {
    if (data) {
      store.setItems(data.items);
      store.setCategories(data.categories);
    }
    store.setLoading(loading);
  }, [data, loading]); // Fixed dependencies

  const createItemHandler = async (itemData: any) => {
    const result = await createItem(itemData);
    if (result) {
      refetch();
    }
    return result;
  };

  const updateItemHandler = async (itemId: string, itemData: any) => {
    const result = await updateItem({ itemId, ...itemData });
    if (result) {
      refetch();
    }
    return result;
  };

  const deleteItemHandler = async (itemId: string) => {
    const result = await deleteItem({ itemId });
    if (result) {
      refetch();
    }
    return result;
  };

  const adjustStockHandler = async (itemId: string, adjustment: any) => {
    const result = await adjustStock({ itemId, ...adjustment });
    if (result) {
      refetch();
    }
    return result;
  };

  return {
    items: store.items,
    categories: store.categories,
    selectedCategory: store.selectedCategory,
    searchQuery: store.searchQuery,
    isLoading: store.isLoading,
    filteredItems: store.getFilteredItems(),
    lowStockItems: store.getLowStockItems(),
    expiringItems: store.getExpiringItems(),
    totalValue: data?.totalValue || 0,
    setSelectedCategory: store.setSelectedCategory,
    setSearchQuery: store.setSearchQuery,
    refetchInventory: refetch,
    createItem: createItemHandler,
    updateItem: updateItemHandler,
    deleteItem: deleteItemHandler,
    adjustStock: adjustStockHandler,
    creating,
    updating,
  };
}
