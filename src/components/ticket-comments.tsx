'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  Shield, 
  Bot,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  type: 'PUBLIC' | 'INTERNE' | 'SYSTÈME';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface TicketCommentsProps {
  ticketId: string;
  currentUserRole?: string;
  currentUserId?: string;
}

export function TicketComments({ ticketId, currentUserRole = 'CLIENT', currentUserId = '' }: TicketCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'PUBLIC' | 'INTERNE'>('PUBLIC');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'INTERNE'>('ALL');

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          type: commentType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'INTERNE':
        return <EyeOff className="h-4 w-4 text-orange-500" />;
      case 'SYSTÈME':
        return <Bot className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'bg-blue-100 text-blue-800';
      case 'INTERNE':
        return 'bg-orange-100 text-orange-800';
      case 'SYSTÈME':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'ALL') return true;
    if (filter === 'PUBLIC') return comment.type === 'PUBLIC' || comment.type === 'SYSTÈME';
    if (filter === 'INTERNE') return comment.type === 'INTERNE';
    return true;
  });

  const canAddInternalComments = currentUserRole === 'AGENT' || currentUserRole === 'ADMIN';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires ({comments.length})
            </CardTitle>
            <CardDescription>
              Historique des communications sur ce ticket
            </CardDescription>
          </div>
          
          {/* Filtre */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
                {canAddInternalComments && (
                  <SelectItem value="INTERNE">Interne</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Formulaire d'ajout de commentaire */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ajouter un commentaire:</span>
              
              {canAddInternalComments && (
                <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="INTERNE">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Interne
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                commentType === 'INTERNE' 
                  ? "Commentaire interne (visible uniquement par les agents)..." 
                  : "Commentaire public (visible par le client)..."
              }
              rows={3}
            />
            
            <Button type="submit" disabled={!newComment.trim() || isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Liste des commentaires */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun commentaire {filter !== 'ALL' && `de type ${filter.toLowerCase()}`}</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div 
                key={comment.id} 
                className={`border rounded-lg p-4 ${
                  comment.type === 'INTERNE' ? 'bg-orange-50 border-orange-200' : 
                  comment.type === 'SYSTÈME' ? 'bg-gray-50 border-gray-200' : 
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.type === 'SYSTÈME' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          getUserInitials(comment.user.name)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.type === 'SYSTÈME' ? 'Système' : comment.user.name}
                        </span>
                        
                        {comment.type !== 'SYSTÈME' && (
                          <Badge variant="outline" className={getUserRoleColor(comment.user.role)}>
                            {comment.user.role}
                          </Badge>
                        )}
                        
                        <Badge variant="outline" className={getCommentTypeColor(comment.type)}>
                          <div className="flex items-center gap-1">
                            {getCommentIcon(comment.type)}
                            {comment.type}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm leading-relaxed">
                  {comment.content}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}