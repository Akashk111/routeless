import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_STUDENT: User = {
  id: 'user-std-1',
  name: 'Ananya Rao',
  email: 'student@routeless.org',
  role: 'student',
  phone: '+91 98451 22341',
  village: 'Kinnigoli',
  institution: "Alva's College, Moodbidri",
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-02-10T08:00:00Z'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('routeless_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STUDENT;
      }
    }
    return DEFAULT_STUDENT; // Default student login for instant hackathon demo
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('routeless_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('routeless_user');
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
    } catch (e) {
      // Local fallback if backend temporarily uncontacted
      if (role === 'student') {
        setUser(DEFAULT_STUDENT);
      } else if (role === 'admin') {
        setUser({
          id: 'user-adm-1',
          name: 'K. R. Hegde',
          email: 'admin@routeless.org',
          role: 'admin',
          phone: '+91 94480 55120',
          village: 'Mangaluru Central Control',
          institution: 'KSRTC / Rural Transport Authority',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          createdAt: '2026-01-01T08:00:00Z'
        });
      } else {
        setUser({
          id: 'user-opr-1',
          name: 'Suresh Naik',
          email: 'operator@routeless.org',
          role: 'operator',
          phone: '+91 97410 99882',
          village: 'Moodbidri Depot',
          institution: 'Route 14B Lead Conductor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          createdAt: '2026-02-01T08:00:00Z'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('routeless_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
