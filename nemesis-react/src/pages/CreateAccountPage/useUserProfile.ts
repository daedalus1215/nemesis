import { useState, useEffect } from 'react';
import api from '../../api/axios.interceptor';

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface UseUserProfileResult {
  userDetails: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useUserProfile = (): UseUserProfileResult => {
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/users/profile');
        setUserDetails(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return {
    userDetails,
    loading,
    error,
  };
};
