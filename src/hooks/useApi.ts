import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  url: string,
  options: ApiOptions = { immediate: true }
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });


  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      
      setState({
        data: result.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message,
      });
      
      toast.error(error.message || 'An error occurred while fetching data');
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [url, options.immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<T, R = any>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [state, setState] = useState<ApiState<R>>({
    data: null,
    loading: false,
    error: null,
  });


  const mutate = async (data?: T): Promise<R | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }
      
      setState({
        data: result.data,
        loading: false,
        error: null,
      });

      toast.success(result.message || 'Operation completed successfully');

      return result.data;
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message,
      });

      toast.error(error.message || 'An error occurred while fetching data');

      return null;
    }
  };

  return {
    ...state,
    mutate,
  };
}