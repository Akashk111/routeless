import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  recentAlertToast: AppNotification | null;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [recentAlertToast, setRecentAlertToast] = useState<AppNotification | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications(user?.role);
      setNotifications(data);
    } catch (err) {
      // ignore silently on offline
    }
  }, [user?.role]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 6000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      // local update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const clearToast = () => setRecentAlertToast(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        recentAlertToast,
        clearToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
