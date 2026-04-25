import { useState, useEffect } from 'react';
import api from '../../api/axios.interceptor';
import { Account } from '../../api/responses/account.response';

type UseAccountsResult = {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchAccounts = (): UseAccountsResult => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/accounts');
      setAccounts(response.data.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  };
};
