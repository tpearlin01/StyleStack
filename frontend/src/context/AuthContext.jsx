import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USER } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('stylestack_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading session', e);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem('stylestack_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('stylestack_session');
      }
    } catch (e) {
      console.error('Error writing session', e);
    }
  }, [session]);

  const loginWithRole = async ({ email, phone, password, role, fullName }) => {
    // Validate inputs
    if (!email || !phone || !password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    if (phone.length !== 10) {
      return { success: false, message: 'Phone number must be exactly 10 digits.' };
    }

    const userObj = {
      id: 'usr-' + Date.now(),
      name: fullName || (email ? email.split('@')[0] : 'User'),
      email,
      phone,
      role: role || 'customer',
      avatar: MOCK_USER.avatar,
    };

    const newSession = {
      user: userObj,
      role: role || 'customer',
      isAuthenticated: true,
      token: 'jwt-mock-token-' + Date.now(),
    };

    setSession(newSession);

    return {
      success: true,
      data: newSession,
      message: `Welcome, ${userObj.name}!`,
    };
  };

  const demoLogin = (role = 'customer') => {
    const isCustomer = role === 'customer';
    const demoSession = {
      user: {
        id: isCustomer ? 'usr-cust-101' : 'usr-admin-999',
        name: isCustomer ? 'Princel Tixeira' : 'Store Administrator',
        email: isCustomer ? 'princel@stylestack.com' : 'admin@stylestack.com',
        phone: '9876543210',
        role: role,
        avatar: MOCK_USER.avatar,
      },
      role: role,
      isAuthenticated: true,
      token: 'demo-jwt-token-' + Date.now(),
    };

    setSession(demoSession);
    return demoSession;
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('stylestack_session');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        role: session?.role || null,
        isAuthenticated: !!session?.isAuthenticated,
        loginWithRole,
        demoLogin,
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
