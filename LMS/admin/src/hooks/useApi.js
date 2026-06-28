import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling API requests
 * @param {Function} apiFunction - The API function to call
 * @param {any} initialData - Initial data state
 * @param {boolean} autoFetch - Whether to fetch data on mount
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApi = (apiFunction, initialData = null, autoFetch = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for handling mutation API requests
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} { execute, loading, error, data }
 */
export const useApiMutation = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { execute, loading, error, data };
};

export default useApi;
