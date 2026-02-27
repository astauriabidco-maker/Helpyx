import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notifications';

class NotificationService {
  private socket: Socket | null = null;
  private notificationCallback: ((notification: Notification) => void) | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io({
      path: '/api/socketio',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔔 Notification service connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔔 Notification service disconnected');
    });

    this.socket.on('notification', (notification: Notification) => {
      if (this.notificationCallback) {
        this.notificationCallback({
          ...notification,
          timestamp: new Date(notification.timestamp)
        });
      }
    });

    this.socket.on('notifications_batch', (notifications: Notification[]) => {
      notifications.forEach(notification => {
        if (this.notificationCallback) {
          this.notificationCallback({
            ...notification,
            timestamp: new Date(notification.timestamp)
          });
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallback = callback;
  }

  // Envoyer une notification (pour les tests)
  sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    if (this.socket?.connected) {
      this.socket.emit('send_notification', notification);
    }
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  // S'abonner aux notifications d'un type spécifique
  subscribe(type: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_notifications', { type });
    }
  }

  // Se désabonner des notifications d'un type
  unsubscribe(type: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_notifications', { type });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();