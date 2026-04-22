import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import api from "../api/axios.interceptor";

type UseAccountBalanceResult = {
  balance: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<QueryObserverResult<unknown, Error>>;
};

export const useAccountBalance = (accountId: number): UseAccountBalanceResult => {
  const {
    data: balance,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountBalance', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/accounts/${accountId}/balance`);
      return data.balance || 0;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute (more frequent updates for balances)
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });

  return {
    balance: balance || null,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
