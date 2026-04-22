import { useState, useEffect } from 'react';
import api from '../api/axios.interceptor';
import { User } from '../api/responses/user.response';

type UseUsersResult = {
  users: User[];
  loading: boolean;
  error: string | null;
};

export const useFetchUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/users');
        setUsers(response.data || []);
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
