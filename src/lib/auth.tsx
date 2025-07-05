'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

// Mock users for frontend-only testing
const MOCK_USERS = [
  {
    id: '1',
    email: 'customer1@onelink.ng',
    password: 'Customer123!',
    firstName: 'Adebayo',
    lastName: 'Oladapo',
    phone: '+2348012345678',
    role: 'CUSTOMER' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'customer2@onelink.ng',
    password: 'Customer123!',
    firstName: 'Chiamaka',
    lastName: 'Okoro',
    phone: '+2348023456789',
    role: 'CUSTOMER' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'customer3@onelink.ng',
    password: 'Customer123!',
    firstName: 'Olumide',
    lastName: 'Adebayo',
    phone: '+2348034567890',
    role: 'CUSTOMER' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    email: 'admin@onelink.ng',
    password: 'Admin123!',
    firstName: 'Ibrahim',
    lastName: 'Mohammed',
    phone: '+2348045678901',
    role: 'ADMIN' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    email: 'superadmin@onelink.ng',
    password: 'SuperAdmin123!',
    firstName: 'Funmi',
    lastName: 'Adebayo',
    phone: '+2348056789012',
    role: 'SUPERADMIN' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // Try backend first, fallback to mock
      let user = null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          user = data.data;
        }
      } catch (backendError) {
        // Backend not available, use mock authentication
        console.log('Backend not available, using mock authentication');
        
        const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (mockUser) {
          const { password: _, ...userWithoutPassword } = mockUser;
          user = userWithoutPassword;
          
          // Store in localStorage for persistence
          localStorage.setItem('mockAuthUser', JSON.stringify(user));
        }
      }

      if (!user) {
        throw new Error('Invalid email or password');
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Try backend logout first
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Backend logout failed, using mock logout');
    } finally {
      // Always clear local storage and logout
      localStorage.removeItem('mockAuthUser');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const checkAuthStatus = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Try backend auth check first
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
        return;
      }
    } catch (error) {
      console.log('Backend auth check failed, checking mock auth');
    }

    // Fallback to mock authentication
    try {
      const mockUser = localStorage.getItem('mockAuthUser');
      if (mockUser) {
        const user = JSON.parse(mockUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
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

export type { User, AuthState, AuthContextType };
