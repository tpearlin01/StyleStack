import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USER } from '../services/mockData';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'stylestack_users';
const SESSION_STORAGE_KEY = 'stylestack_session';

const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading registered users from localStorage', e);
    return [];
  }
};

const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving registered users to localStorage', e);
  }
};

export const AuthProvider = ({ children }) => {
  // Strict entry gateway: Always mount unauthenticated so page reload or fresh visit displays the Welcome & Login screen first
  const [session, setSession] = useState(null);

  useEffect(() => {
    try {
      // Clear any session in storage on initial mount so reloads never auto-bypass to storefront
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing initial session', e);
    }
  }, []);

  // Sign Up: dynamic registration stored into localStorage stylestack_users
  const registerUser = async ({ fullName, email, password, role = 'customer' }) => {
    const trimmedName = (fullName || '').trim();
    const trimmedEmail = (email || '').toLowerCase().trim();
    const normalizedRole = (role || 'customer').toLowerCase().trim();

    if (!trimmedName) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (!trimmedEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }

    const users = getRegisteredUsers();
    const existingUser = users.find(
      (u) => (u.email || '').toLowerCase().trim() === trimmedEmail
    );

    if (existingUser) {
      return { success: false, message: 'Email already registered. Please log in.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const newUser = {
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      role: normalizedRole === 'admin' ? 'admin' : 'customer',
    };

    saveRegisteredUsers([...users, newUser]);

    return {
      success: true,
      message: 'Account registered successfully! Please sign in with your credentials.',
    };
  };

  // Sign In: dynamic authentication verifying against stylestack_users
  const loginUser = async ({ email, password, role = 'customer' }) => {
    const trimmedEmail = (email || '').toLowerCase().trim();
    const targetRole = (role || 'customer').toLowerCase().trim();

    if (!trimmedEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }

    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const users = getRegisteredUsers();
    const matchedUser = users.find(
      (u) => (u.email || '').toLowerCase().trim() === trimmedEmail
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'No account found with this email. Please sign up first.',
      };
    }

    if (password.length < 6 || matchedUser.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Role verification: non-admin accounts cannot access admin portal
    if (targetRole === 'admin' && matchedUser.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied: Non-admin accounts cannot access the Admin portal.',
      };
    }

    const activeUser = {
      id: 'usr-' + Date.now(),
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      avatar: MOCK_USER.avatar,
    };

    const newSession = {
      user: activeUser,
      role: matchedUser.role,
      isAuthenticated: true,
      token: 'jwt-session-token-' + Date.now(),
    };

    setSession(newSession);

    return {
      success: true,
      data: newSession,
      currentUser: activeUser,
      message: `Welcome, ${activeUser.name}!`,
    };
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing session on logout', e);
    }
  };

  const currentUser = session?.user || null;

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        user: currentUser,
        role: session?.role || null,
        isAuthenticated: !!session?.isAuthenticated,
        registerUser,
        loginUser,
        loginWithRole: loginUser,
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

