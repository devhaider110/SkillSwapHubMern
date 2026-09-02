import { createContext, useContext, useEffect, useState } from 'react';
import {
  login as loginAPI,
  register as registerAPI,
  getMe,
  logout as logoutAPI,
} from '../services/api';

const AuthContext = createContext(null);

const getStoredAccessToken = () => localStorage.getItem('accessToken');
const getStoredRefreshToken = () => localStorage.getItem('refreshToken');

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(getStoredAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  // Restore the existing login session once when the application starts.
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = getStoredAccessToken();

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getMe();
        const currentUser = response?.data?.user;

        if (!currentUser) {
          throw new Error('User data was not returned by /user/me');
        }

        if (mounted) {
          setAccessToken(getStoredAccessToken());
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Session restore failed:', error);

        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep React state synchronized if api.js refreshes or clears a token.
  useEffect(() => {
    const handleTokenRefresh = () => {
      setAccessToken(getStoredAccessToken());
    };

    const handleLogout = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefresh);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await loginAPI({
        email: email.trim(),
        password,
      });

      const data = response?.data;
      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken;
      const loggedInUser = data?.user;

      if (!newAccessToken || !newRefreshToken || !loggedInUser) {
        return {
          success: false,
          message: 'Invalid login response from server.',
        };
      }

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      setAccessToken(newAccessToken);
      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'Login failed.',
      };
    }
  };

  const registerUser = async (name, username, email, password) => {
    try {
      const response = await registerAPI({
        name,
        username,
        email: email.trim(),
        password,
      });

      const data = response?.data;

      // Registration requires email verification, so do not create a session here.
      return {
        success: Boolean(data?.success),
        requiresVerification: true,
        message:
          data?.message ||
          'Registration successful. Please verify your email before logging in.',
        user: data?.user || null,
      };
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = async () => {
    try {
      if (getStoredAccessToken()) {
        await logoutAPI();
      }
    } catch (error) {
      console.warn('Server logout failed:', error.response?.data?.message || error.message);
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    accessToken,
    token: accessToken, // backward compatibility
    refreshToken: getStoredRefreshToken(),
    loading,
    isAuthenticated: Boolean(user && accessToken),
    loginUser,
    registerUser,
    logout,
    setUser,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};