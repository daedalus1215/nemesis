import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios.interceptor";

const fetchUserBalance = async () => {
  const { data } = await api.get('/accounts/balance');
  return data.totalBalance;
};

export const useUserBalance = () => {
  return useQuery({
    queryKey: ['userBalance'],
    queryFn: fetchUserBalance,
    retry: false,
  });
}; 