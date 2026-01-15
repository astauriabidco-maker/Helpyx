'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  type: 'ticket_assigned' | 'ticket_updated' | 'comment_added' | 'ticket_closed' | 'ticket_escalated';
  ticketId: string;
  ticketNumber: string;
  userId: string;
  message: string;
  timestamp: string;
  data?: any;
}

export const NotificationCenter: React.FC<{ userId?: string; userRole?: string }> = ({ 
  userId, 
  userRole 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isConnected, markNotificationAsRead, clearNotifications } = useSocket(userId, userRole);
  const unreadCount = notifications.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_assigned':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'ticket_updated':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'comment_added':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'ticket_closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ticket_escalated':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ticket_assigned':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800';
      case 'ticket_updated':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800';
      case 'comment_added':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800';
      case 'ticket_closed':
        return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800';
      case 'ticket_escalated':
        return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const handleNotificationClick = (notification: Notification, index: number) => {
    markNotificationAsRead(index);
    
    // Navigate to ticket if applicable
    if (notification.ticketId) {
      window.location.href = `/tickets/${notification.ticketId}`;
    }
    
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 shadow-lg z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={`${notification.timestamp}-${index}`}
                      onClick={() => handleNotificationClick(notification, index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ticket {notification.ticketNumber}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(index);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};