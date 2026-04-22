import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import api from "../../api/axios.interceptor";

type Transaction = {
  id: number;
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  category: string;
  debitAccountId: number;
  creditAccountId: number;
  initiatingUserId?: number;
  counterpartyUserId?: number;
  createdAt: string;
  updatedAt: string;
};

type TransactionWithType = Transaction & {
  type: 'INCOMING' | 'OUTGOING';
  otherAccountId: number;
};

type PageData = {
  transactions: TransactionWithType[];
  currentBalance: number;
};

type UseAccountTransactionsResult = {
  transactions: TransactionWithType[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

export const useAccountTransactions = (
  accountId: number,
  limit: number = 20,
): UseAccountTransactionsResult => {
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PageData, Error, InfiniteData<PageData>, (string | number)[], number>({
    queryKey: ['accountPayments', accountId, limit],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get(`/accounts/${accountId}/payments`, {
        params: { limit, offset: pageParam }
      });
      
      // Transform transactions to add type and other account info
      const transactions = response.data.transactions.map((tx: Transaction): TransactionWithType => {
        const isIncoming = tx.creditAccountId === accountId;
        return {
          ...tx,
          type: isIncoming ? 'INCOMING' : 'OUTGOING',
          otherAccountId: isIncoming ? tx.debitAccountId : tx.creditAccountId,
        };
      });
      
      return { transactions, currentBalance: response.data.currentBalance };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page had fewer transactions than limit, we've reached the end
      if (lastPage.transactions.length < limit) {
        return undefined;
      }
      // Otherwise, return the next offset
      return allPages.length * limit;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnMount: 'always',
  });

  // Flatten all pages into a single array
  const transactions = data?.pages.flatMap(page => page.transactions) || [];

  return {
    transactions,
    loading,
    error: error ? (error as Error).message : null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage,
  };
};
