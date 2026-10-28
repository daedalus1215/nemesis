import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import api from '../api/axios.interceptor';
import { isAccessDenied } from '../tauri/cloudflare-access';
import { claimOfflineData, clearOfflineData } from '../offline/offline-data';

type User = {
  id: number;
  username: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<true | string>;
}

type JwtPayload = {
  sub: string;  // This will be our user ID
  username: string;
  iat: number;
  exp: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return null;
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const user = {
        id: Number(decoded.sub),
        username: decoded.username
      };
      return user;
    } catch {
      localStorage.removeItem('jwt_token');
      return null;
    }
  });

  const isAuthenticated = !!user;

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        username,
        password,
      });

      const { access_token } = response.data;
      
      // Decode the JWT to get user information
      const decoded = jwtDecode<JwtPayload>(access_token);
      const userData = {
        id: Number(decoded.sub),
        username: decoded.username
      };

      // The app's stored data (src/offline) may be another user's: it's
      // deleted before this login can be shown any of it.
      await claimOfflineData(String(decoded.sub)).catch((error) =>
        console.error('Could not check whose offline data this is:', error)
      );
      localStorage.setItem('jwt_token', access_token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      // Only Nemesis turning the credentials down is a failed login. Anything
      // else (no connection, the server down, Cloudflare Access rejecting the
      // app's token) is thrown for the login page to report as such.
      if (axios.isAxiosError(error) && error.response?.status === 401 && !isAccessDenied(error)) {
        return false;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    // Nothing kept for offline use outlives the session it belongs to.
    clearOfflineData().catch((error) =>
      console.error('Could not delete the offline data:', error)
    );
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<true | string> => {
    try {
      await api.post('/users/register', {
        username,
        password,
      });
      return true;
    } catch (error: unknown) {
      return (error as { response: { data: { message: string } } }).response.data.message;
    }
  }, []);

  // Update authentication status if token changes in another tab/window
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_token') {
        try {
          if (!e.newValue) {
            setUser(null);
            return;
          }
          const decoded = jwtDecode<JwtPayload>(e.newValue);
          const userData = {
            id: Number(decoded.sub),
            username: decoded.username
          };
          console.log('Storage event: updating user state:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse updated token:', error);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    register,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 