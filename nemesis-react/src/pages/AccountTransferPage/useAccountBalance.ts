import { useState, useCallback } from 'react';
import api from '../../api/axios.interceptor';

interface UseAccountBalanceResult {
  getAccountBalance: (accountId: number) => Promise<number>;
  loading: boolean;
  error: string | null;
}

export const useAccountBalance = (): UseAccountBalanceResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccountBalance = useCallback(async (accountId: number): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/accounts/${accountId}/balance`);
      return response.data.balance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAccountBalance,
    loading,
    error,
  };
};
