'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  farm: {
    id: string;
    name: string;
    totalSeats: number;
    activeMembers: number;
  };
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@octapulse.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@octapulse.com',
      name: 'Dr. Sarah Chen',
      role: 'admin',
      farm: {
        id: 'farm-1',
        name: 'Pacific Aquaculture Research',
        totalSeats: 10,
        activeMembers: 7,
      },
    },
  },
  'member@octapulse.com': {
    password: 'member123',
    user: {
      id: '2',
      email: 'member@octapulse.com',
      name: 'James Rodriguez',
      role: 'member',
      farm: {
        id: 'farm-1',
        name: 'Pacific Aquaculture Research',
        totalSeats: 10,
        activeMembers: 7,
      },
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('octapulse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('octapulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[email.toLowerCase()];

    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    setUser(mockUser.user);
    localStorage.setItem('octapulse_user', JSON.stringify(mockUser.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('octapulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
