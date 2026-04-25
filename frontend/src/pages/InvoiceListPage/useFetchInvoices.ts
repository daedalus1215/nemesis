import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../api/axios.interceptor';
import { Invoice } from '../../api/responses/invoice.response';

interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchInvoices = (statuses?: string[]): UseInvoicesResult => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusKey = useMemo(() => {
    return statuses && statuses.length > 0 ? statuses.sort().join(',') : 'all';
  }, [statuses]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = statusKey !== 'all' 
        ? { statuses: statusKey }
        : {};
      const response = await api.get('/invoices', { params });
      setInvoices(response.data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusKey]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
  };
};

