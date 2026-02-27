'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Notification, type NotificationSettings } from '@/types/notifications';
import { notificationService } from '@/services/notification-service';

// Déclaration des types pour l'API Notification
declare global {
  interface Window {
    Notification: typeof Notification;
  }

  interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
}

// Fonction utilitaire pour vérifier la disponibilité des notifications desktop
const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    window.Notification !== undefined;
};

// Fonction utilitaire pour obtenir la permission de notification
const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return window.Notification.permission;
};

// Fonction utilitaire pour demander la permission de notification
const requestNotificationPermission = (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return Promise.resolve('denied');
  return window.Notification.requestPermission();
};

interface NotificationContextType {
  notifications: Notification[];
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  unreadCount: number;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  types: {
    ticket: true,
    system: true,
    user: true,
    billing: true,
  },
  priority: {
    low: true,
    medium: true,
    high: true,
    critical: true,
  },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isConnected, setIsConnected] = useState(false);

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }
  }, []);

  // Sauvegarder les notifications dans le localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sauvegarder les paramètres dans le localStorage
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Demander la permission pour les notifications desktop
  useEffect(() => {
    if (settings.desktop && getNotificationPermission() === 'default') {
      requestNotificationPermission();
    }
  }, [settings.desktop]);

  // Connexion à Socket.io
  useEffect(() => {
    // Récupérer le token depuis le localStorage ou le contexte d'auth
    const token = localStorage.getItem('auth-token') || 'demo-token';

    notificationService.connect(token);
    notificationService.onNotification(handleIncomingNotification);

    // Surveiller l'état de connexion
    const checkConnection = () => {
      setIsConnected(notificationService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Vérification initiale

    return () => {
      clearInterval(interval);
      notificationService.disconnect();
    };
  }, []);

  const handleIncomingNotification = (notification: Notification) => {
    if (!settings.enabled) return;

    // Vérifier si le type est activé
    if (!settings.types[notification.type as keyof typeof settings.types]) return;

    // Vérifier si la priorité est activée
    if (!settings.priority[notification.priority]) return;

    setNotifications(prev => [notification, ...prev]);

    // Son de notification
    if (settings.sound) {
      playNotificationSound(notification.type, notification.priority);
    }

    // Notification desktop
    if (settings.desktop && getNotificationPermission() === 'granted') {
      showDesktopNotification(notification);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    handleIncomingNotification(newNotification);

    // Envoyer via Socket.io si connecté
    if (isConnected) {
      notificationService.sendNotification(notification);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Envoyer via Socket.io si connecté
    if (isConnected) {
      notificationService.markAsRead(id);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        settings,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        updateSettings,
        unreadCount,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Fonctions utilitaires
function playNotificationSound(type: string, priority: string) {
  try {
    const audio = new Audio();

    // Différents sons selon le type et la priorité
    if (priority === 'critical') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    } else if (type === 'ticket') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    } else {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }

    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignorer les erreurs de lecture audio
    });
  } catch (error) {
    // Ignorer les erreurs audio
  }
}

function showDesktopNotification(notification: Notification) {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return;
  }

  const notificationOptions: NotificationOptions = {
    body: notification.message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: notification.id,
    requireInteraction: notification.priority === 'critical',
  };

  const desktopNotification = new window.Notification(notification.title, notificationOptions);

  desktopNotification.onclick = () => {
    window.focus();
    if (notification.action) {
      notification.action.onClick();
    }
    desktopNotification.close();
  };

  // Auto-fermeture après 5 secondes sauf pour les critiques
  if (notification.priority !== 'critical') {
    setTimeout(() => {
      desktopNotification.close();
    }, 5000);
  }
}