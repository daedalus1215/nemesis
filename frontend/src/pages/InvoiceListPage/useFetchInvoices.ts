import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../api/axios.interceptor';
import { Invoice } from '../../api/responses/invoice.response';
import { invoiceListParams, statusesKey } from './invoice-filters';

interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchInvoices = (
  statuses?: string[],
  direction?: string,
): UseInvoicesResult => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusKey = useMemo(() => statusesKey(statuses), [statuses]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/invoices', {
        params: invoiceListParams(statusKey, direction),
      });
      setInvoices(response.data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusKey, direction]);

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

