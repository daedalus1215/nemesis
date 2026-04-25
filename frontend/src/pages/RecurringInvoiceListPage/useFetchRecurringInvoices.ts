import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios.interceptor';
import { RecurringInvoice } from '../../api/responses/recurring-invoice.response';

type UseFetchRecurringInvoicesResult = {
  recurringInvoices: RecurringInvoice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useFetchRecurringInvoices = (status?: string): UseFetchRecurringInvoicesResult => {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecurringInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? { status } : {};
      const response = await api.get('/recurring-invoices', { params });
      setRecurringInvoices(response.data.recurringInvoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchRecurringInvoices();
  }, [fetchRecurringInvoices]);

  return {
    recurringInvoices,
    loading,
    error,
    refetch: fetchRecurringInvoices,
  };
};
