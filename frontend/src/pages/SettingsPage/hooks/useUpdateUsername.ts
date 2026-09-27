import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios.interceptor';
import { UPDATE_USERNAME_URL } from '../../../api/urls';
import { useAuth } from '../../../auth/useAuth';

/**
 * NestJS exception messages live in `response.data.message` (a string or,
 * for validation errors, an array). `AxiosError.message` is not user-facing.
 */
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    const data = (
      err as Error & { response?: { data?: { message?: string | string[] } } }
    ).response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(' ') : data.message;
    }
    return err.message;
  }
  return 'Something went wrong';
};

/**
 * Updates the signed-in user's username. The JWT payload contains the
 * username, so a successful change requires re-authentication: the session
 * is cleared and the user is sent to the login page.
 */
export const useUpdateUsername = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUsername = useCallback(
    async (newUsername: string, currentPassword: string): Promise<void> => {
      setIsUpdating(true);
      setError(null);
      try {
        await api.put(UPDATE_USERNAME_URL, { newUsername, currentPassword });
        logout();
        navigate('/login', { replace: true });
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [logout, navigate],
  );

  return { updateUsername, isUpdating, error };
};
