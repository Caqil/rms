import { useState, useEffect } from 'react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useApi, useApiMutation } from './useApi';

export function useInventory() {
  const inventoryStore = useInventoryStore();
  
  const { data: inventoryData, loading, refetch } = useApi<{
    items: any[];
    categories: string[];
    totalValue: number;
  }>('/api/inventory');

  const { mutate: createInventoryItem, loading: creating } = useApiMutation('/api/inventory', 'POST');
  const { mutate: updateInventoryItem, loading: updating } = useApiMutation('/api/inventory', 'PATCH');
  const { mutate: deleteInventoryItem } = useApiMutation('/api/inventory', 'DELETE');
  const { mutate: adjustInventoryStock } = useApiMutation('/api/inventory/adjust', 'POST');

  useEffect(() => {
    if (inventoryData) {
      inventoryStore.setItems(inventoryData.items);
      inventoryStore.setCategories(inventoryData.categories);
    }
    inventoryStore.setLoading(loading);
  }, [inventoryData, loading]);

  // Get expiring items (within 7 days)
  const expiringItems = inventoryStore.items.filter(item => {
    if (!item.expirationDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  const createItem = async (data: any) => {
    const result = await createInventoryItem(data);
    if (result) {
      refetch();
    }
    return result;
  };

  const updateItem = async (itemId: string, data: any) => {
    const result = await updateInventoryItem({ itemId, ...data });
    if (result) {
      refetch();
    }
    return result;
  };

  const deleteItem = async (itemId: string) => {
    const result = await deleteInventoryItem({ itemId });
    if (result) {
      refetch();
    }
    return result;
  };

  const adjustStock = async (itemId: string, adjustment: any) => {
    const result = await adjustInventoryStock({ itemId, ...adjustment });
    if (result) {
      refetch();
    }
    return result;
  };

  return {
    items: inventoryStore.items,
    categories: inventoryStore.categories,
    selectedCategory: inventoryStore.selectedCategory,
    searchQuery: inventoryStore.searchQuery,
    isLoading: inventoryStore.isLoading,
    filteredItems: inventoryStore.getFilteredItems(),
    lowStockItems: inventoryStore.getLowStockItems(),
    expiringItems,
    totalValue: inventoryData?.totalValue || 0,
    setSelectedCategory: inventoryStore.setSelectedCategory,
    setSearchQuery: inventoryStore.setSearchQuery,
    refetchInventory: refetch,
    createItem,
    updateItem,
    deleteItem,
    adjustStock,
    creating,
    updating,
  };
}
