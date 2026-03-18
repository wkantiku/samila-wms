import { useState, useCallback, useEffect } from 'react';

/**
 * useApi — one-shot API call with loading/error state
 * const { execute, loading, error } = useApi(inventoryService.adjust);
 */
export function useApi(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      return result;
    } catch (err) {
      const msg = err?.detail || err?.message || 'เกิดข้อผิดพลาด';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFn]); // eslint-disable-line react-hooks/exhaustive-deps

  return { execute, loading, error };
}

/**
 * useApiData — fetch data on mount (or when deps change)
 * const { data, loading, error, reload } = useApiData(() => inventoryService.getAll());
 */
export function useApiData(apiFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err?.detail || err?.message || 'เกิดข้อผิดพลาด');
      return null;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, setData };
}
