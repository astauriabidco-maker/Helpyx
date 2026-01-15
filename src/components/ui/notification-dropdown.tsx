'use client';

import { useState } from 'react';
import { Bell, BellRing, X, Check, Settings, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useNotifications } from '@/contexts/notification-context';
import { Notification } from '@/types/notifications';

const notificationIcons = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  ticket: '🎫',
  system: '🔧',
  user: '👤',
};

const notificationColors = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  ticket: 'bg-purple-50 border-purple-200 text-purple-800',
  system: 'bg-gray-50 border-gray-200 text-gray-800',
  user: 'bg-indigo-50 border-indigo-200 text-indigo-800',
};

function NotificationItem({ notification, onMarkAsRead, onRemove }: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative p-4 border rounded-lg transition-all duration-200
        ${notification.read 
          ? 'bg-white border-gray-200 opacity-75' 
          : 'bg-gradient-to-r from-blue-50 to-white border-blue-200 shadow-sm'
        }
        ${isHovered ? 'shadow-md transform -translate-y-0.5' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indicateur de non-lecture */}
      {!notification.read && (
        <div className="absolute top-2 right-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icône */}
        <div className="text-2xl flex-shrink-0">
          {notificationIcons[notification.type]}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${notificationColors[notification.type]}`}
              >
                {notification.priority}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatTime(notification.timestamp)}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(notification.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action */}
          {notification.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={notification.action.onClick}
              className="mt-2 w-full"
            >
              {notification.action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const { settings, updateSettings } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Paramètres généraux */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Général</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Activer les notifications</label>
            <p className="text-xs text-gray-500">Recevoir des notifications en temps réel</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Son</label>
            <p className="text-xs text-gray-500">Jouer un son lors des notifications</p>
          </div>
          <Switch
            checked={settings.sound}
            onCheckedChange={(sound) => updateSettings({ sound })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Notifications bureau</label>
            <p className="text-xs text-gray-500">Afficher les notifications du système</p>
          </div>
          <Switch
            checked={settings.desktop}
            onCheckedChange={(desktop) => updateSettings({ desktop })}
          />
        </div>
      </div>

      {/* Types de notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Types de notifications</h3>
        
        {Object.entries(settings.types).map(([type, enabled]) => (
          <div key={type} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium capitalize">
                {type === 'ticket' ? 'Tickets' : 
                 type === 'system' ? 'Système' : 
                 type === 'user' ? 'Utilisateurs' : 
                 type === 'billing' ? 'Facturation' : type}
              </label>
              <p className="text-xs text-gray-500">
                {type === 'ticket' ? 'Nouveaux tickets et mises à jour' :
                 type === 'system' ? 'Alertes et maintenance système' :
                 type === 'user' ? 'Inscriptions et activités' :
                 type === 'billing' ? 'Paiements et factures' : ''}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(enabled) => 
                updateSettings({ 
                  types: { ...settings.types, [type]: enabled }
                })
              }
            />
          </div>
        ))}
      </div>

      {/* Priorités */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Niveaux de priorité</h3>
        
        {Object.entries(settings.priority).map(([priority, enabled]) => (
          <div key={priority} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium capitalize">
                {priority === 'low' ? 'Basse' :
                 priority === 'medium' ? 'Moyenne' :
                 priority === 'high' ? 'Haute' : 'Critique'}
              </label>
              <p className="text-xs text-gray-500">
                {priority === 'low' ? 'Informations générales' :
                 priority === 'medium' ? 'Mises à jour importantes' :
                 priority === 'high' ? 'Actions requises' : 'Urgences'}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(enabled) => 
                updateSettings({ 
                  priority: { ...settings.priority, [priority]: enabled }
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-1.5 py-0 text-xs min-w-[20px] h-5"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Tout marquer comme lu
                </Button>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Paramètres des notifications</DialogTitle>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1">
                Vous recevrez les notifications importantes ici
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}