// src/contexts/NotificationContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useEffect,
  } from 'react';
  import { Snackbar, Alert, AlertColor, AlertTitle } from '@mui/material';
  import { notificationService } from '../services/notificationService'; // Import the service
  
  // Define the shape of the notification
  type Notification = {
    open: boolean;
    message: string;
    severity: AlertColor;
    title?: string;
  };
  
  // Define the context type
  type NotificationContextType = {
    showNotification: (
      message: string,
      severity: AlertColor,
      title?: string
    ) => void;
    hideNotification: () => void;
  };
  
  // Create the context
  const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
  );
  
  // Custom hook to use the NotificationContext
  export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
      throw new Error(
        'useNotification must be used within a NotificationProvider'
      );
    }
    return context;
  };
  
  // Define the provider props
  type NotificationProviderProps = {
    children: ReactNode;
  };
  
  // Create the provider component
  export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
  }) => {
    const [notification, setNotification] = useState<Notification>({
      open: false,
      message: '',
      severity: 'info',
      title: '',
    });
  
    // Function to show a notification
    const showNotification = useCallback(
      (message: string, severity: AlertColor, title?: string) => {
        setNotification({
          open: true,
          message,
          severity,
          title,
        });
      },
      []
    );
  
    // Function to hide the notification
    const hideNotification = useCallback(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, []);
  
    // Listen to notifications from the notificationService
    useEffect(() => {
      const handleNotify = (notif: {
        message: string;
        severity: AlertColor;
        title?: string;
      }) => {
        showNotification(notif.message, notif.severity, notif.title);
      };
  
      notificationService.on('notify', handleNotify);
  
      // Cleanup the listener on unmount
      return () => {
        notificationService.off('notify', handleNotify);
      };
    }, [showNotification]);
  
    return (
      <NotificationContext.Provider value={{ showNotification, hideNotification }}>
        {children}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={hideNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={hideNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%', color: 'white' }}
          >
            {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
            {notification.message}
          </Alert>
        </Snackbar>
      </NotificationContext.Provider>
    );
  };
  