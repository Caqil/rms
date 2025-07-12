import { useEffect, useCallback } from 'react';
import { useMenuStore, MenuItem } from '@/stores/menuStore';
import { useApi } from './useApi';

interface MenuApiResponse {
  items: MenuItem[];
  categories: string[];
}

export function useMenu() {
  const store = useMenuStore();
  const { data, loading, refetch } = useApi<MenuApiResponse>('/api/menu');

  useEffect(() => {
    if (data) {
      store.setItems(data.items);
      store.setCategories(data.categories);
    }
    store.setLoading(loading);
  }, [data, loading]); // Removed store functions from deps

  return {
    items: store.items,
    categories: store.categories,
    selectedCategory: store.selectedCategory,
    searchQuery: store.searchQuery,
    isLoading: store.isLoading,
    filteredItems: store.getFilteredItems(),
    setSelectedCategory: store.setSelectedCategory,
    setSearchQuery: store.setSearchQuery,
    refetchMenu: refetch,
  };
}