import { useCallback, useEffect, useRef, useState } from 'react';
import { platformAdminApi } from '../api/platform';

const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const refreshSources = useCallback(() => {}, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      setLoading(true);
      platformAdminApi.search(trimmed)
        .then((payload) => setResults(payload.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, refreshSources]);

  return {
    query,
    setQuery,
    results: query.trim() ? results : [],
    loading: Boolean(query.trim()) && loading,
    refreshSources,
  };
}
