import React, { createContext, useContext, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const pushNotifications = usePushNotifications();

  // Don't auto-initialize here, let components that need it call setupNotifications
  // This prevents navigation errors during app startup

  return (
    <NotificationContext.Provider value={pushNotifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
