import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios.interceptor";

const fetchUserTransactions = async () => {
  const { data } = await api.get('/balances/transactions/for-user');
  return data;
};

export const useUserTransactions = () => {
  return useQuery({
    queryKey: ['userTransactions'],
    queryFn: fetchUserTransactions,
    retry: false,
  });
}; 