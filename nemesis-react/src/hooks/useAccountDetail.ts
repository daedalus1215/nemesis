import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import api from "../api/axios.interceptor";

export type AccountDetail = {
  id: number;
  name: string;
  accountType: string;
  isDefault: boolean;
  createdAt: string;
};

type UseAccountDetailResult = {
  account: AccountDetail;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<QueryObserverResult<unknown, Error>>;
};

export const useAccountDetail = (accountId: number): UseAccountDetailResult => {
  const {
    data: account,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountDetail', accountId],
    queryFn: async () => {
      const response = await api.get(`/accounts/detail/${accountId}`);
      return response.data;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    account: account || null,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
