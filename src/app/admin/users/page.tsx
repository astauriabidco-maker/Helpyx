'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  Headphones,
  RefreshCw,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Ticket,
  AlertCircle,
  CheckCircle,
  User as UserIcon,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  company: { id: string; name: string; slug: string } | null;
  _count: { tickets: number; assignedTickets: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  'ADMIN': { label: 'Admin', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: ShieldCheck },
  'AGENT': { label: 'Agent', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Headphones },
  'CLIENT': { label: 'Client', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: UserIcon },
};

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'CLIENT' as string,
  phone: '',
  isActive: true,
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogues
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (searchTerm) params.set('search', searchTerm);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();

      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Stats calculées
  const stats = {
    total: pagination.total,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    agents: users.filter(u => u.role === 'AGENT').length,
    clients: users.filter(u => u.role === 'CLIENT').length,
  };

  // Création d'utilisateur
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || null,
          companyId: session?.user?.companyId || null,
        }),
      });

      if (res.status === 409) {
        toast.error('Cet email est déjà utilisé');
        return;
      }
      if (!res.ok) throw new Error('Erreur de création');

      toast.success(`Utilisateur ${formData.name} créé avec succès`);
      setIsCreateOpen(false);
      setFormData(EMPTY_FORM);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modification d'utilisateur
  const handleEdit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || null,
          isActive: formData.isActive,
        }),
      });

      if (res.status === 409) {
        toast.error('Cet email est déjà utilisé');
        return;
      }
      if (!res.ok) throw new Error('Erreur de mise à jour');

      toast.success(`Utilisateur ${formData.name} mis à jour`);
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'utilisateur
  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur de suppression');

      toast.success(`Utilisateur ${selectedUser.name || selectedUser.email} supprimé`);
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle actif/inactif
  const toggleActive = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error('Erreur');

      toast.success(`${user.name || user.email} ${!user.isActive ? 'activé' : 'désactivé'}`);
      fetchUsers(pagination.page);
    } catch {
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} enregistré{pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchUsers(pagination.page)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData(EMPTY_FORM); setShowPassword(false); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvel utilisateur</DialogTitle>
                <DialogDescription>Créez un compte pour un nouvel utilisateur</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="create-name">Nom complet *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@exemple.com"
                  />
                </div>
                <div>
                  <Label htmlFor="create-password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 caractères"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rôle *</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="create-phone">Téléphone</Label>
                    <Input
                      id="create-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter('all')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Tous les utilisateurs</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${roleFilter === 'AGENT' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setRoleFilter(roleFilter === 'AGENT' ? 'all' : 'AGENT')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Headphones className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.agents}</div>
            <p className="text-xs text-muted-foreground">Support technique</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${roleFilter === 'CLIENT' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setRoleFilter(roleFilter === 'CLIENT' ? 'all' : 'CLIENT')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <UserIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs finaux</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${roleFilter === 'ADMIN' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? 'all' : 'ADMIN')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Administrateurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des utilisateurs */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-muted-foreground">Chargement...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-1">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Aucun utilisateur ne correspond aux filtres.'
                  : 'Commencez par ajouter un utilisateur.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Utilisateur</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Rôle</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Tickets</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Dernière connexion</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Inscription</th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG['CLIENT'];
                    const RoleIcon = roleConf.icon;
                    const isSelf = user.id === session?.user?.id;

                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                        {/* Utilisateur */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${user.role === 'ADMIN' ? 'bg-amber-500' : user.role === 'AGENT' ? 'bg-purple-500' : 'bg-blue-500'
                              } ${!user.isActive ? 'opacity-50' : ''}`}>
                              {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-medium text-sm ${!user.isActive ? 'opacity-50' : ''}`}>
                                  {user.name || 'Sans nom'}
                                </p>
                                {isSelf && <Badge variant="outline" className="text-xs py-0">Vous</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Phone className="h-3 w-3" />{user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rôle */}
                        <td className="p-4">
                          <Badge className={`${roleConf.color} gap-1`}>
                            <RoleIcon className="h-3 w-3" />
                            {roleConf.label}
                          </Badge>
                        </td>

                        {/* Statut */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => toggleActive(user)}
                              disabled={isSelf}
                            />
                            <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </td>

                        {/* Tickets */}
                        <td className="p-4">
                          <div className="text-sm">
                            {user.role === 'AGENT' || user.role === 'ADMIN' ? (
                              <span className="flex items-center gap-1">
                                <Ticket className="h-3.5 w-3.5 text-purple-500" />
                                {user._count?.assignedTickets || 0} assigné{(user._count?.assignedTickets || 0) > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Ticket className="h-3.5 w-3.5 text-blue-500" />
                                {user._count?.tickets || 0} créé{(user._count?.tickets || 0) > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dernière connexion */}
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.lastLoginAt)}
                          </span>
                        </td>

                        {/* Inscription */}
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              disabled={isSelf}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.pages} ({pagination.total} résultat{pagination.total > 1 ? 's' : ''})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modifier */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nom complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rôle</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
              <div>
                <p className="text-sm font-medium">Compte actif</p>
                <p className="text-xs text-muted-foreground">Désactiver empêche la connexion</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Supprimer l&apos;utilisateur
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.name || selectedUser?.email}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (selectedUser._count?.tickets > 0 || selectedUser._count?.assignedTickets > 0) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">⚠️ Attention</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Cet utilisateur a {selectedUser._count.tickets} ticket(s) créé(s)
                {selectedUser._count.assignedTickets > 0 && ` et ${selectedUser._count.assignedTickets} ticket(s) assigné(s)`}.
                La suppression peut affecter ces données.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}