'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  X,
  UserCheck,
  MessageSquare,
  Settings
} from 'lucide-react';
import { JWTClient } from '@/lib/jwt-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'TICKET_ASSIGNED' | 'TICKET_UPDATED' | 'TICKET_RESOLVED' | 'COMMENT_ADDED' | 'SYSTEM_ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
  ticket?: {
    id: number;
    titre?: string;
    status: string;
    priorite: string;
  };
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await JWTClient.authenticatedFetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    setIsLoading(true);
    try {
      const response = await JWTClient.authenticatedFetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          markAllAsRead: !notificationIds,
        }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_ASSIGNED':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'TICKET_UPDATED':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'TICKET_RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITIQUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HAUTE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MOYENNE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BASSE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de la cloche */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panneau des notifications */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead()}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tout marquer comme lu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.ticket && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Ticket #{notification.ticket.id}
                              </Badge>
                              {notification.ticket.priorite && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.ticket.priorite)}`}
                                >
                                  {notification.ticket.priorite}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                            
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead([notification.id]);
                                }}
                                disabled={isLoading}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}