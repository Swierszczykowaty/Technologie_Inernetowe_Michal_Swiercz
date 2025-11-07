'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ApiNotification {
  message: string;
  status: number;
  ok: boolean;
  url: string;
}

interface NotificationContextType {
  notification: ApiNotification | null;
  showNotification: (data: ApiNotification) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<ApiNotification | null>(null);

  const showNotification = (data: ApiNotification) => {
    setNotification(data);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}