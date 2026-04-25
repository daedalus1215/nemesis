import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import api from '../../api/axios.interceptor';
import { Invoice } from '../../api/responses/invoice.response';
import { INVOICE_DETAIL_URL } from '../../api/urls';

type UseInvoiceResult = {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<QueryObserverResult<Invoice | null, Error>>;
};

export const useFetchInvoiceById = (invoiceId: number): UseInvoiceResult => {
  const {
    data: invoice,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await api.get(INVOICE_DETAIL_URL(invoiceId));
      return response.data.invoice;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    invoice: invoice || null,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

