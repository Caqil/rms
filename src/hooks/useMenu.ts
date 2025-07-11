import { useEffect } from 'react';
import { useMenuStore, MenuItem } from '@/stores/menuStore';
import { useApi } from './useApi';

interface MenuApiResponse {
  items: MenuItem[];
  categories: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useMenu() {
  const {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    setItems,
    setCategories,
    setSelectedCategory,
    setSearchQuery,
    setLoading,
    getFilteredItems,
  } = useMenuStore();

  const { data: menuData, loading, refetch } = useApi<MenuApiResponse>('/api/menu');

  useEffect(() => {
    if (menuData) {
      setItems(menuData.items);
      setCategories(menuData.categories);
    }
    setLoading(loading);
  }, [menuData, loading, setItems, setCategories, setLoading]);

  return {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    filteredItems: getFilteredItems(),
    setSelectedCategory,
    setSearchQuery,
    refetchMenu: refetch,
  };
}
