import { useCallback, useState } from 'react';
import api from '../../../api/axios.interceptor';
import { UPDATE_PASSWORD_URL } from '../../../api/urls';

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
 * Updates the signed-in user's password. The password is not part of the
 * JWT, so the existing session stays valid after the change.
 */
export const useUpdatePassword = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ): Promise<void> => {
      setIsUpdating(true);
      setError(null);
      try {
        await api.put(UPDATE_PASSWORD_URL, {
          currentPassword,
          newPassword,
          confirmPassword,
        });
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return { updatePassword, isUpdating, error };
};
