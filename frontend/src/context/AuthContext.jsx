import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('stylestack_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError('');
  };

  const login = async ({ email, password, rememberMe }) => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      const res = await apiService.loginUser({ email, password, rememberMe });
      if (res.success) {
        setUser(res.data);
        if (rememberMe) {
          localStorage.setItem('stylestack_user', JSON.stringify(res.data));
        } else {
          sessionStorage.setItem('stylestack_user', JSON.stringify(res.data));
        }
        closeAuthModal();
        return { success: true };
      } else {
        setAuthError(res.message);
        return { success: false, message: res.message };
      }
    } catch (err) {
      setAuthError('Authentication failed. Please try again.');
      return { success: false, message: 'Auth failed' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async ({ fullName, email, password }) => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      const res = await apiService.registerUser({ fullName, email, password });
      if (res.success) {
        setUser(res.data);
        localStorage.setItem('stylestack_user', JSON.stringify(res.data));
        closeAuthModal();
        return { success: true };
      } else {
        setAuthError(res.message);
        return { success: false, message: res.message };
      }
    } catch (err) {
      setAuthError('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stylestack_user');
    sessionStorage.removeItem('stylestack_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        authMode,
        authError,
        isSubmitting,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
