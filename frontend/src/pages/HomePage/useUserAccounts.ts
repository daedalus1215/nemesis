import { useState, useEffect } from 'react';
import api from '../../api/axios.interceptor';

interface Account {
  id: number;
  name: string;
  accountType: string;
  isDefault: boolean;
  createdAt: string;
  balance: number;
}

interface UserAccountsResponse {
  accounts: Account[];
  success: boolean;
}

export const useUserAccounts = () => {
  const [data, setData] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get<UserAccountsResponse>('/accounts');
        setData(response.data.accounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return { data, isLoading, error };
};
