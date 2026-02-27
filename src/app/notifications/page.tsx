'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bell,
  Send,
  Search,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  Settings,
  UserCheck,
  Calendar,
  Trash2,
  Eye,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
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

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT' as string,
    userId: ''
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=50');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setTotal(data.total || 0);
      } else {
        toast.error('Erreur lors du chargement des notifications');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId?: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          notificationId
            ? { notificationIds: [notificationId] }
            : { markAllAsRead: true }
        ),
      });

      if (response.ok) {
        fetchNotifications();
        toast.success(notificationId ? 'Notification marquée comme lue' : 'Toutes les notifications marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Notification supprimée');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const sendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Le titre et le message sont obligatoires');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });

      if (response.ok) {
        toast.success('Notification envoyée avec succès');
        setIsSendDialogOpen(false);
        setNewNotification({ title: '', message: '', type: 'SYSTEM_ANNOUNCEMENT', userId: '' });
        fetchNotifications();
      } else {
        const err = await response.json();
        toast.error(err.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TICKET_ASSIGNED': return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'TICKET_UPDATED': return <Settings className="w-4 h-4 text-orange-500" />;
      case 'TICKET_RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'COMMENT_ADDED': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'SYSTEM_ANNOUNCEMENT': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'TICKET_ASSIGNED': 'Assignation',
      'TICKET_UPDATED': 'Mise à jour',
      'TICKET_RESOLVED': 'Résolution',
      'COMMENT_ADDED': 'Commentaire',
      'SYSTEM_ANNOUNCEMENT': 'Système',
    };
    return map[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const map: Record<string, string> = {
      'TICKET_ASSIGNED': 'bg-blue-100 text-blue-800',
      'TICKET_UPDATED': 'bg-orange-100 text-orange-800',
      'TICKET_RESOLVED': 'bg-green-100 text-green-800',
      'COMMENT_ADDED': 'bg-purple-100 text-purple-800',
      'SYSTEM_ANNOUNCEMENT': 'bg-gray-100 text-gray-800',
    };
    return map[type] || 'bg-gray-100 text-gray-800';
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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesRead = readFilter === 'all' ||
      (readFilter === 'unread' && !notification.read) ||
      (readFilter === 'read' && notification.read);

    return matchesSearch && matchesType && matchesRead;
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Centre de Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {total} notification{total > 1 ? 's' : ''} · {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAsRead()}>
                <Check className="h-4 w-4 mr-2" />
                Tout marquer lu
              </Button>
            )}
            {isAdmin && (
              <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Envoyer une notification</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Destinataire (vide = tous les utilisateurs)</Label>
                      <Input
                        value={newNotification.userId}
                        onChange={(e) => setNewNotification({ ...newNotification, userId: e.target.value })}
                        placeholder="ID utilisateur (optionnel)"
                      />
                    </div>
                    <div>
                      <Label>Titre *</Label>
                      <Input
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                        placeholder="Titre de la notification"
                      />
                    </div>
                    <div>
                      <Label>Message *</Label>
                      <Textarea
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        placeholder="Contenu du message"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={newNotification.type} onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SYSTEM_ANNOUNCEMENT">Annonce système</SelectItem>
                          <SelectItem value="TICKET_UPDATED">Mise à jour</SelectItem>
                          <SelectItem value="TICKET_ASSIGNED">Assignation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={sendNotification} disabled={isSending}>
                        {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card className={unreadCount > 0 ? "border-blue-200" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non lues</CardTitle>
              <Mail className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'TICKET_ASSIGNED' || n.type === 'TICKET_UPDATED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolues</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'TICKET_RESOLVED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="TICKET_ASSIGNED">Assignation</SelectItem>
                  <SelectItem value="TICKET_UPDATED">Mise à jour</SelectItem>
                  <SelectItem value="TICKET_RESOLVED">Résolution</SelectItem>
                  <SelectItem value="COMMENT_ADDED">Commentaire</SelectItem>
                  <SelectItem value="SYSTEM_ANNOUNCEMENT">Système</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="unread">Non lues</SelectItem>
                  <SelectItem value="read">Lues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des notifications */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-1">Aucune notification</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || typeFilter !== 'all' || readFilter !== 'all'
                    ? 'Aucune notification ne correspond aux filtres.'
                    : 'Vous n\'avez aucune notification pour le moment.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-all ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/5' : ''
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                        )}
                        <Badge className={`text-xs ${getTypeBadgeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4">
                        {notification.ticket && (
                          <Link href={`/tickets/${notification.ticket.id}`}>
                            <Badge variant="outline" className="text-xs hover:bg-blue-50 cursor-pointer">
                              Ticket #{notification.ticket.id} · {notification.ticket.priorite}
                            </Badge>
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 px-2 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}