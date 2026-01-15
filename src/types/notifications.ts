export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'system' | 'user';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: {
    userId?: string;
    companyId?: string;
    ticketId?: string;
    [key: string]: any;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  types: {
    ticket: boolean;
    system: boolean;
    user: boolean;
    billing: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
}