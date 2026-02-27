'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Settings,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fermer le panneau en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (notificationIds?: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      case 'CRITIQUE': return 'bg-red-100 text-red-800 border-red-200';
      case 'HAUTE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BASSE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`relative ${className}`} ref={panelRef}>
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
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panneau des notifications */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 shadow-xl z-50 border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Tout est à jour'
                  }
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
                    Tout lu
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
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${!notification.read
                          ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.ticket && (
                            <Link
                              href={`/tickets/${notification.ticket.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  #{notification.ticket.id}
                                </Badge>
                                {notification.ticket.priorite && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-1.5 py-0 ${getPriorityColor(notification.ticket.priorite)}`}
                                  >
                                    {notification.ticket.priorite}
                                  </Badge>
                                )}
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </Link>
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
                                className="h-5 px-1.5 text-xs"
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

            {/* Footer link to full notifications page */}
            <div className="border-t p-2">
              <Link href="/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}