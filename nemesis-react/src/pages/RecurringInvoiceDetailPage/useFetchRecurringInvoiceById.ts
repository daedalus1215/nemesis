import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import api from '../../api/axios.interceptor';
import { RecurringInvoice } from '../../api/responses/recurring-invoice.response';
import { RECURRING_INVOICE_DETAIL_URL } from '../../api/urls';

type UseRecurringInvoiceResult = {
  recurringInvoice: RecurringInvoice | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<QueryObserverResult<RecurringInvoice | null, Error>>;
};

export const useFetchRecurringInvoiceById = (id: number): UseRecurringInvoiceResult => {
  const {
    data: recurringInvoice,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['recurring-invoice', id],
    queryFn: async () => {
      const response = await api.get(RECURRING_INVOICE_DETAIL_URL(id));
      return response.data.recurringInvoice;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    recurringInvoice: recurringInvoice || null,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
