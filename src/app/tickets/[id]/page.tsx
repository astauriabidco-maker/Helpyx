'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  User as UserIcon,
  Calendar,
  Tag,
  Wrench,
  XCircle,
  Send,
  Search,
  Loader2,
  Shield,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  MapPin,
  Phone,
  Mail,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Ticket {
  id: number;
  titre: string | null;
  description: string;
  status: string;
  priorite: string;
  categorie: string | null;
  type_panne: string | null;
  equipement_type: string | null;
  marque: string | null;
  modele: string | null;
  numero_serie: string | null;
  systeme_exploitation: string | null;
  ram: string | null;
  processeur: string | null;
  stockage: string | null;
  reseau: string | null;
  site: string | null;
  batiment: string | null;
  etage: string | null;
  bureau: string | null;
  telephone_contact: string | null;
  email_contact: string | null;
  symptomes: string | null;
  messages_erreur: string | null;
  solutions_testees: string | null;
  impact_travail: string | null;
  utilisateurs_affectes: string | null;
  tags: string | null;
  garantie: boolean;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  actualResolutionTime: string | null;
  user: { id: string; name: string | null; email: string };
  assignedTo: { id: string; name: string | null; email: string } | null;
  comments: Comment[];
  files: TicketFile[];
}

interface Comment {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: { id: string; name: string | null; role: string };
}

interface TicketFile {
  id: number;
  nom: string;
  taille: number;
  type: string;
}

interface Agent {
  id: string;
  name: string | null;
  email: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'OUVERT': { label: 'Ouvert', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-500' },
  'EN_DIAGNOSTIC': { label: 'En diagnostic', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-500' },
  'EN_REPARATION': { label: 'En réparation', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-500' },
  'REPARÉ': { label: 'Réparé', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-500' },
  'FERMÉ': { label: 'Fermé', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-500' },
  'ANNULÉ': { label: 'Annulé', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-500' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'CRITIQUE': { label: 'Critique', color: 'bg-red-600 text-white' },
  'HAUTE': { label: 'Haute', color: 'bg-orange-500 text-white' },
  'MOYENNE': { label: 'Moyenne', color: 'bg-yellow-500 text-white' },
  'BASSE': { label: 'Basse', color: 'bg-green-500 text-white' },
};

const STATUS_FLOW = ['OUVERT', 'EN_DIAGNOSTIC', 'EN_REPARATION', 'REPARÉ', 'FERMÉ'];

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Commentaires
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'PUBLIC' | 'INTERNE'>('PUBLIC');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Agents pour assignation
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAgent = session?.user?.role === 'AGENT' || session?.user?.role === 'ADMIN';
  const ticketId = params.id as string;

  useEffect(() => {
    if (ticketId) {
      loadTicket();
      if (isAgent) loadAgents();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Ticket non trouvé');
        throw new Error('Erreur serveur');
      }
      const data = await res.json();
      setTicket(data);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/admin/users?role=AGENT');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.users || data || []);
      }
    } catch {
      // Silently fail - optional feature
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ticket) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur de mise à jour');
      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      loadTicket();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const assignTicket = async (agentId: string) => {
    if (!ticket) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: agentId }),
      });
      if (!res.ok) throw new Error('Erreur d\'assignation');
      toast.success('Ticket assigné');
      loadTicket();
    } catch {
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setIsUpdating(false);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim() || !ticket || !session?.user) return;
    setIsSendingComment(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
          'x-user-role': session.user.role,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          type: commentType,
        }),
      });
      if (!res.ok) throw new Error('Erreur d\'envoi');
      toast.success('Commentaire ajouté');
      setNewComment('');
      loadTicket();
      // Scroll to bottom
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch {
      toast.error('Erreur lors de l\'envoi du commentaire');
    } finally {
      setIsSendingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  };

  const parseJsonArray = (json: string | null) => {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Chargement du ticket...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error || 'Ticket introuvable'}</h2>
            <Link href="/tickets">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[ticket.status] || { label: ticket.status, color: 'bg-gray-100', bgColor: 'bg-gray-500' };
  const priorityConf = PRIORITY_CONFIG[ticket.priorite] || { label: ticket.priorite, color: 'bg-gray-500 text-white' };
  const tags = parseTags(ticket.tags);
  const currentStatusIndex = STATUS_FLOW.indexOf(ticket.status);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{ticket.titre || 'Sans titre'}</h1>
              <Badge variant="outline" className="font-mono text-sm">#{ticket.id}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Créé le {formatDate(ticket.createdAt)} par {ticket.user?.name || ticket.user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={priorityConf.color} >{priorityConf.label}</Badge>
          <Badge className={statusConf.color}>{statusConf.label}</Badge>
        </div>
      </div>

      {/* Workflow Progress */}
      {isAgent && ticket.status !== 'FERMÉ' && ticket.status !== 'ANNULÉ' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              {STATUS_FLOW.map((step, index) => {
                const stepConf = STATUS_CONFIG[step];
                const isActive = step === ticket.status;
                const isPast = index < currentStatusIndex;
                const isFuture = index > currentStatusIndex;

                return (
                  <div key={step} className="flex items-center flex-1">
                    <Button
                      variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                      size="sm"
                      className={`flex-1 text-xs ${isActive ? '' : isPast ? 'opacity-70' : 'opacity-40'} ${isFuture && index === currentStatusIndex + 1 ? 'opacity-80 hover:opacity-100' : ''}`}
                      disabled={isUpdating || (!isFuture || index > currentStatusIndex + 1)}
                      onClick={() => {
                        if (isFuture && index === currentStatusIndex + 1) {
                          updateStatus(step);
                        }
                      }}
                    >
                      {isPast ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      {stepConf.label}
                    </Button>
                    {index < STATUS_FLOW.length - 1 && (
                      <div className={`w-6 h-0.5 mx-1 ${isPast ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

              {ticket.solutions_testees && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Solutions déjà testées :</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{ticket.solutions_testees}</p>
                </div>
              )}

              {ticket.impact_travail && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Impact :</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{ticket.impact_travail}</p>
                  {ticket.utilisateurs_affectes && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">Utilisateurs affectés : {ticket.utilisateurs_affectes}</p>
                  )}
                </div>
              )}

              {/* Symptômes & erreurs */}
              {(ticket.symptomes || ticket.messages_erreur) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ticket.symptomes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-2">SYMPTÔMES</p>
                      <div className="flex flex-wrap gap-1">
                        {parseJsonArray(ticket.symptomes).map((s: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {ticket.messages_erreur && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-2">MESSAGES D&apos;ERREUR</p>
                      <div className="flex flex-wrap gap-1">
                        {parseJsonArray(ticket.messages_erreur).map((e: string, i: number) => (
                          <Badge key={i} variant="destructive" className="text-xs font-mono">{e}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Commentaires ({ticket.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                {ticket.comments?.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">Aucun commentaire pour le moment</p>
                )}
                {ticket.comments?.map((comment) => {
                  const isSystem = comment.type === 'SYSTÈME';
                  const isInternal = comment.type === 'INTERNE';
                  const isOwnComment = comment.user?.id === session?.user?.id;

                  if (isSystem) {
                    return (
                      <div key={comment.id} className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <RefreshCw className="h-3 w-3" />
                        <span>{comment.content}</span>
                        <span className="ml-auto">{formatDate(comment.createdAt)}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={comment.id} className={`p-4 rounded-lg border ${isInternal ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : isOwnComment ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${comment.user?.role === 'ADMIN' ? 'bg-amber-500' : comment.user?.role === 'AGENT' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                            {comment.user?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-sm">{comment.user?.name || 'Anonyme'}</span>
                          {comment.user?.role === 'AGENT' && <Badge variant="outline" className="text-xs">Agent</Badge>}
                          {comment.user?.role === 'ADMIN' && <Badge variant="outline" className="text-xs">Admin</Badge>}
                          {isInternal && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Interne
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap ml-9">{comment.content}</p>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>

              {/* Formulaire de commentaire */}
              {ticket.status !== 'FERMÉ' && ticket.status !== 'ANNULÉ' && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Ajouter un commentaire</span>
                    {isAgent && (
                      <Select value={commentType} onValueChange={(v: any) => setCommentType(v)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="INTERNE">Interne</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={commentType === 'INTERNE' ? 'Note interne (non visible par le client)...' : 'Écrire un commentaire...'}
                      className={`flex-1 min-h-[80px] ${commentType === 'INTERNE' ? 'border-amber-300' : ''}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendComment();
                      }}
                    />
                    <Button
                      onClick={sendComment}
                      disabled={!newComment.trim() || isSendingComment}
                      className="self-end"
                    >
                      {isSendingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ctrl+Entrée pour envoyer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar droite */}
        <div className="space-y-6">
          {/* Assignation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignation</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.assignedTo ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {ticket.assignedTo.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{ticket.assignedTo.name || ticket.assignedTo.email}</p>
                    <p className="text-xs text-muted-foreground">{ticket.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Non assigné</p>
              )}

              {isAgent && agents.length > 0 && (
                <div className="mt-3">
                  <Select
                    value={ticket.assignedToId || ''}
                    onValueChange={(agentId) => assignTicket(agentId)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Assigner à..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name || agent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations équipement */}
          {(ticket.equipement_type || ticket.marque || ticket.modele) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Équipement
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {ticket.equipement_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{ticket.equipement_type}</span>
                  </div>
                )}
                {ticket.marque && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marque</span>
                    <span className="font-medium">{ticket.marque}</span>
                  </div>
                )}
                {ticket.modele && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium">{ticket.modele}</span>
                  </div>
                )}
                {ticket.numero_serie && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">N° série</span>
                    <span className="font-medium font-mono text-xs">{ticket.numero_serie}</span>
                  </div>
                )}
                {ticket.garantie && (
                  <Badge className="bg-green-100 text-green-800">Sous garantie</Badge>
                )}

                <Separator className="my-2" />

                {ticket.systeme_exploitation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OS</span>
                    <span className="font-medium">{ticket.systeme_exploitation}</span>
                  </div>
                )}
                {ticket.processeur && (
                  <div className="flex items-center gap-1 justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU</span>
                    <span className="font-medium text-xs">{ticket.processeur}</span>
                  </div>
                )}
                {ticket.ram && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAM</span>
                    <span className="font-medium">{ticket.ram}</span>
                  </div>
                )}
                {ticket.stockage && (
                  <div className="flex items-center gap-1 justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="h-3 w-3" /> Stockage</span>
                    <span className="font-medium">{ticket.stockage}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Localisation */}
          {(ticket.site || ticket.batiment || ticket.etage || ticket.bureau) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {ticket.site && <div className="flex justify-between"><span className="text-muted-foreground">Site</span><span className="font-medium">{ticket.site}</span></div>}
                {ticket.batiment && <div className="flex justify-between"><span className="text-muted-foreground">Bâtiment</span><span className="font-medium">{ticket.batiment}</span></div>}
                {ticket.etage && <div className="flex justify-between"><span className="text-muted-foreground">Étage</span><span className="font-medium">{ticket.etage}</span></div>}
                {ticket.bureau && <div className="flex justify-between"><span className="text-muted-foreground">Bureau</span><span className="font-medium">{ticket.bureau}</span></div>}
              </CardContent>
            </Card>
          )}

          {/* Tags & Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Détails</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {ticket.type_panne && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type panne</span>
                  <Badge variant="outline">{ticket.type_panne}</Badge>
                </div>
              )}
              {ticket.categorie && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{ticket.categorie}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium text-xs">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mis à jour</span>
                <span className="font-medium text-xs">{formatDate(ticket.updatedAt)}</span>
              </div>
              {ticket.actualResolutionTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Résolu le</span>
                  <span className="font-medium text-xs">{formatDate(ticket.actualResolutionTime)}</span>
                </div>
              )}

              {tags.length > 0 && (
                <div className="pt-2">
                  <p className="text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demandeur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Demandeur
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {ticket.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium">{ticket.user?.name || 'Inconnu'}</p>
                  <p className="text-xs text-muted-foreground">{ticket.user?.email}</p>
                </div>
              </div>
              {ticket.telephone_contact && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {ticket.telephone_contact}
                </div>
              )}
              {ticket.email_contact && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  {ticket.email_contact}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}