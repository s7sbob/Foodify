// src/services/notificationService.ts

import {EventEmitter} from 'eventemitter3';

// Define the shape of a notification
type Notification = {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
};

// Create a NotificationService extending EventEmitter
class NotificationService extends EventEmitter {
  notify(notification: Notification) {
    this.emit('notify', notification);
  }
}

// Instantiate and export the notification service
export const notificationService = new NotificationService();
