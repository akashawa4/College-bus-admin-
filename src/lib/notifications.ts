// Custom notification service using browser's Notification API
class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported');
      return;
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission not granted');
        return;
      }
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico', // You can change this to your app icon
        badge: '/favicon.ico',
        tag: 'admin-dashboard',
        requireInteraction: false,
        silent: false,
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public success(message: string): void {
    this.showNotification('Success', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'success',
      requireInteraction: false
    });
  }

  public error(message: string): void {
    this.showNotification('Error', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'error',
      requireInteraction: false
    });
  }

  public info(message: string): void {
    this.showNotification('Info', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'info',
      requireInteraction: false
    });
  }

  public warning(message: string): void {
    this.showNotification('Warning', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'warning',
      requireInteraction: false
    });
  }
}

export const notificationService = NotificationService.getInstance();

// Custom toast functions that use system notifications
export const customToast = {
  success: (message: string) => {
    notificationService.success(message);
  },
  error: (message: string) => {
    notificationService.error(message);
  },
  info: (message: string) => {
    notificationService.info(message);
  },
  warning: (message: string) => {
    notificationService.warning(message);
  }
};

