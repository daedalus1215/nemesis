import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios.interceptor";

type AccountBalance = { [key: number]: number };

const fetchAccountBalances = async (accountIds: number[]): Promise<AccountBalance> => {
  if (accountIds.length === 0) return {};
  
  const balances: AccountBalance = {};
  for (const accountId of accountIds) {
    try {
      const { data } = await api.get(`/accounts/${accountId}/balance`);
      balances[accountId] = data.balance || 0;
    } catch (err) {
      console.error(`Failed to load balance for account ${accountId}:`, err);
      balances[accountId] = 0;
    }
  }
  return balances;
};

export const useAccountBalances = (accountIds: number[]) => {
  return useQuery({
    queryKey: ['accountBalances', accountIds],
    queryFn: () => fetchAccountBalances(accountIds),
    enabled: accountIds.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
