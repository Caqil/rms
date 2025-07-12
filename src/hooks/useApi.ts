import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  immediate?: boolean;
  pollInterval?: number; // For real-time updates (in milliseconds)
}

export function useApi<T>(
  url: string, 
  options: ApiOptions = { immediate: true }
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { data: session } = useSession();
  const fetchedRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!session) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.message || 'API request failed');
      }
    } catch (err) {
      console.error('API Error:', err);
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [url, session]);

  // Initial fetch
  useEffect(() => {
    if (options.immediate && session && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [fetchData, options.immediate, session]);

  // Polling effect (separate from initial fetch)
  useEffect(() => {
    if (options.pollInterval && session && fetchedRef.current) {
      pollIntervalRef.current = setInterval(() => {
        fetchData();
      }, options.pollInterval);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [fetchData, options.pollInterval, session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const refetch = useCallback(() => {
    fetchedRef.current = false;
    return fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

export function useApiMutation<TData = any, TResponse = any>(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const mutate = useCallback(async (data?: TData): Promise<TResponse | null> => {
    if (!session) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TResponse> = await response.json();

      if (result.success) {
        return result.data || result as TResponse;
      } else {
        throw new Error(result.message || 'Request failed');
      }
    } catch (err) {
      console.error('API Mutation Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, session]);

  return {
    mutate,
    loading,
    error,
  };
}