import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios.interceptor";

const fetchUserProfile = async () => {
    const { data } = await api.get('/users/profile');
    return data;
  };

  
export const useUserProfile = () => {
    return useQuery({
      queryKey: ['userProfile'],
      queryFn: fetchUserProfile,
      retry: false, // or true, depending on your needs
    });
  };