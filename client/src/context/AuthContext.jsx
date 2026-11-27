import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on application mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response && response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Not logged in or expired token - quiet fail
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      const userData = response?.data?.user || response?.user || response;
      if (!userData || !userData.email) {
        throw new Error(response?.message || 'Invalid administrator login response.');
      }
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await authService.updateProfile(profileData);
      if (response && response.data && response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    }
  };

  const changePassword = async (passwords) => {
    setError(null);
    try {
      const response = await authService.changePassword(passwords);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      setError(msg);
      throw new Error(msg);
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const setAuthenticatedUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    setAuthenticatedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
