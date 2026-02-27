'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Building2, User, Shield, Mail, Clock, Save, Loader2, Check,
  Upload, Eye, EyeOff, Lock, Bell, Globe, Palette,
  Server, Timer, AlertTriangle, Users, Ticket, Package, BookOpen, Settings as SettingsIcon
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────
interface CompanySettings {
  id: string;
  nom: string;
  slug: string;
  logo: string | null;
  description: string | null;
  secteur: string | null;
  taille: string | null;
  pays: string | null;
  ville: string | null;
  telephone: string | null;
  emailContact: string;
  planAbonnement: string;
  settings: {
    smtp: { host: string; port: number; user: string; password: string; fromEmail: string; fromName: string };
    sla: { critical: number; high: number; medium: number; low: number };
    notifications: { newTicket: boolean; ticketUpdate: boolean; ticketResolved: boolean; newUser: boolean };
    general: { darkMode: boolean; animations: boolean; language: string };
  };
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  address: string | null;
  role: string;
  notification_email: boolean;
  notification_sms: boolean;
  notification_browser: boolean;
  preferences: Record<string, unknown>;
  createdAt: string;
  lastLoginAt: string | null;
  points: number;
  level: number;
  totalTicketsResolved: number;
  company: { id: string; nom: string; logo: string | null } | null;
}

interface RoleData {
  name: string;
  label: string;
  description: string;
  userCount: number;
  permissions: Record<string, boolean>;
}

// ─── Permission Categories & Icons ────────
const categoryIcons: Record<string, React.ReactNode> = {
  'Tickets': <Ticket className="h-4 w-4" />,
  'Utilisateurs': <Users className="h-4 w-4" />,
  'Inventaire': <Package className="h-4 w-4" />,
  'Knowledge Base': <BookOpen className="h-4 w-4" />,
  'Système': <SettingsIcon className="h-4 w-4" />,
};

export default function AdminSettingsPage() {
  const { data: session } = useSession()

  // Company state
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [companyForm, setCompanyForm] = useState<Partial<CompanySettings>>({})
  const [smtpForm, setSmtpForm] = useState({ host: '', port: 587, user: '', password: '', fromEmail: '', fromName: '' })
  const [slaForm, setSlaForm] = useState({ critical: 4, high: 8, medium: 24, low: 72 })
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  // Roles state
  const [roles, setRoles] = useState<RoleData[]>([])
  const [permLabels, setPermLabels] = useState<Record<string, { label: string; category: string }>>({})
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<Record<string, boolean>>({})

  // UI state
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Fetch Data ──────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [compRes, profRes, roleRes] = await Promise.all([
        fetch('/api/settings/company'),
        fetch('/api/settings/profile'),
        fetch('/api/settings/roles'),
      ])

      if (compRes.ok) {
        const data = await compRes.json()
        setCompany(data)
        setCompanyForm(data)
        setSmtpForm(data.settings.smtp)
        setSlaForm(data.settings.sla)
      }

      if (profRes.ok) {
        const data = await profRes.json()
        setProfile(data)
        setProfileForm({ name: data.name || '', email: data.email, phone: data.phone || '', address: data.address || '' })
      }

      if (roleRes.ok) {
        const data = await roleRes.json()
        setRoles(data.roles)
        setPermLabels(data.permissionLabels)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ─── Save Handlers ───────────────────────
  const saveCompany = async () => {
    setSaving('company')
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: companyForm.nom,
          description: companyForm.description,
          secteur: companyForm.secteur,
          taille: companyForm.taille,
          pays: companyForm.pays,
          ville: companyForm.ville,
          telephone: companyForm.telephone,
          emailContact: companyForm.emailContact,
          logo: companyForm.logo,
        })
      })
      if (!res.ok) throw new Error()
      toast.success('Paramètres entreprise sauvegardés')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally { setSaving(null) }
  }

  const saveSmtp = async () => {
    setSaving('smtp')
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { smtp: smtpForm } })
      })
      if (!res.ok) throw new Error()
      toast.success('Configuration SMTP sauvegardée')
    } catch {
      toast.error('Erreur lors de la sauvegarde SMTP')
    } finally { setSaving(null) }
  }

  const saveSla = async () => {
    setSaving('sla')
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { sla: slaForm } })
      })
      if (!res.ok) throw new Error()
      toast.success('SLA sauvegardés')
    } catch {
      toast.error('Erreur lors de la sauvegarde SLA')
    } finally { setSaving(null) }
  }

  const saveProfile = async () => {
    setSaving('profile')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      toast.success('Profil mis à jour')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally { setSaving(null) }
  }

  const changePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères')
      return
    }
    setSaving('password')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      toast.success('Mot de passe modifié')
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally { setSaving(null) }
  }

  const saveRolePermissions = async (role: string) => {
    setSaving('roles')
    try {
      const res = await fetch('/api/settings/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions: editedPermissions })
      })
      if (!res.ok) throw new Error()
      toast.success(`Permissions ${role} mises à jour`)
      setEditingRole(null)
      fetchAll()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally { setSaving(null) }
  }

  // Group permissions by category
  const groupedPermissions = Object.entries(permLabels).reduce((acc, [key, { label, category }]) => {
    if (!acc[category]) acc[category] = []
    acc[category].push({ key, label })
    return acc
  }, {} as Record<string, { key: string; label: string }[]>)

  // ─── Loading state ───────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm">Gérez les paramètres de votre entreprise et votre profil</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email & SLA</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Rôles</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB: ENTREPRISE ═══════════════ */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Informations de l&apos;entreprise
              </CardTitle>
              <CardDescription>Informations principales de votre organisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {companyForm.logo ? (
                    <img src={companyForm.logo} alt="Logo" className="rounded-xl w-full h-full object-cover" />
                  ) : (
                    companyForm.nom?.charAt(0) || 'H'
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Changer le logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l&apos;entreprise</Label>
                  <Input
                    value={companyForm.nom || ''}
                    onChange={e => setCompanyForm({ ...companyForm, nom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input
                    type="email"
                    value={companyForm.emailContact || ''}
                    onChange={e => setCompanyForm({ ...companyForm, emailContact: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={companyForm.telephone || ''}
                    onChange={e => setCompanyForm({ ...companyForm, telephone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secteur d&apos;activité</Label>
                  <Select
                    value={companyForm.secteur || ''}
                    onValueChange={v => setCompanyForm({ ...companyForm, secteur: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technologie</SelectItem>
                      <SelectItem value="sante">Santé</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="industrie">Industrie</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taille</Label>
                  <Select
                    value={companyForm.taille || ''}
                    onValueChange={v => setCompanyForm({ ...companyForm, taille: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="pme">PME (11-250)</SelectItem>
                      <SelectItem value="eti">ETI (251-5000)</SelectItem>
                      <SelectItem value="grand_compte">Grand Compte (5000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    value={companyForm.pays || ''}
                    onChange={e => setCompanyForm({ ...companyForm, pays: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={companyForm.description || ''}
                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                    placeholder="Décrivez votre entreprise..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveCompany} disabled={saving === 'company'}>
                  {saving === 'company' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: EMAIL & SLA ═══════════════ */}
        <TabsContent value="smtp" className="space-y-6">
          {/* SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                Configuration SMTP
              </CardTitle>
              <CardDescription>Serveur d&apos;envoi d&apos;emails pour les notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input
                    value={smtpForm.host}
                    onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={smtpForm.port}
                    onChange={e => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Utilisateur</Label>
                  <Input
                    value={smtpForm.user}
                    onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={smtpForm.password}
                      onChange={e => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    />
                    <Button
                      variant="ghost" size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    >
                      {showSmtpPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email expéditeur</Label>
                  <Input
                    value={smtpForm.fromEmail}
                    onChange={e => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom expéditeur</Label>
                  <Input
                    value={smtpForm.fromName}
                    onChange={e => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                    placeholder="Helpyx Support"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSmtp} disabled={saving === 'smtp'}>
                  {saving === 'smtp' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Sauvegarder SMTP
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SLA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-600" />
                Configuration SLA
              </CardTitle>
              <CardDescription>Délais de résolution par priorité (en heures)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'critical' as const, label: 'Critique', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
                  { key: 'high' as const, label: 'Haute', color: 'text-orange-600', icon: <Clock className="h-4 w-4 text-orange-600" /> },
                  { key: 'medium' as const, label: 'Moyenne', color: 'text-yellow-600', icon: <Clock className="h-4 w-4 text-yellow-600" /> },
                  { key: 'low' as const, label: 'Basse', color: 'text-green-600', icon: <Clock className="h-4 w-4 text-green-600" /> },
                ].map(({ key, label, color, icon }) => (
                  <div key={key} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      {icon}
                      <Label className={color}>{label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={slaForm[key]}
                        onChange={e => setSlaForm({ ...slaForm, [key]: parseInt(e.target.value) || 1 })}
                        className="text-center"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">heures</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSla} disabled={saving === 'sla'}>
                  {saving === 'sla' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Sauvegarder SLA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: PROFIL ═══════════════ */}
        <TabsContent value="profile" className="space-y-6">
          {/* Info personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informations personnelles
              </CardTitle>
              <CardDescription>Modifiez votre profil et vos coordonnées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profile?.image ? (
                    <img src={profile.image} alt="Avatar" className="rounded-full w-full h-full object-cover" />
                  ) : (
                    profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                  )}
                </div>
                <div>
                  <p className="font-medium">{profile?.name || 'Utilisateur'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.role === 'ADMIN' ? 'Administrateur' : profile?.role === 'AGENT' ? 'Agent' : 'Client'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Membre depuis {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Ville, Pays"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving === 'profile'}>
                  {saving === 'profile' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Sauvegarder le profil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Assurez-vous d&apos;utiliser un mot de passe fort d&apos;au moins 8 caractères</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-4">
                {[
                  { key: 'current' as const, label: 'Mot de passe actuel', placeholder: 'Entrez votre mot de passe actuel' },
                  { key: 'new' as const, label: 'Nouveau mot de passe', placeholder: 'Au moins 8 caractères' },
                  { key: 'confirm' as const, label: 'Confirmer', placeholder: 'Retapez le nouveau mot de passe' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords[key] ? 'text' : 'password'}
                        value={passwordForm[key]}
                        onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                        placeholder={placeholder}
                      />
                      <Button
                        variant="ghost" size="sm" type="button"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] })}
                      >
                        {showPasswords[key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={changePassword}
                  disabled={saving === 'password' || !passwordForm.current || !passwordForm.new}
                  variant="outline"
                >
                  {saving === 'password' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                  Modifier le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Préférences de notification
              </CardTitle>
              <CardDescription>Choisissez comment recevoir vos notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'notification_email', label: 'Notifications par email', desc: 'Recevoir des emails pour les mises à jour importantes', icon: <Mail className="h-4 w-4 text-blue-500" /> },
                { key: 'notification_browser', label: 'Notifications navigateur', desc: 'Notifications push dans le navigateur', icon: <Globe className="h-4 w-4 text-green-500" /> },
                { key: 'notification_sms', label: 'Notifications SMS', desc: 'Recevoir des SMS pour les urgences (nécessite un numéro)', icon: <Bell className="h-4 w-4 text-orange-500" /> },
              ].map(({ key, label, desc, icon }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile?.[key as keyof UserProfile] as boolean || false}
                    onCheckedChange={async (checked) => {
                      try {
                        await fetch('/api/settings/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ [key]: checked })
                        })
                        setProfile(p => p ? { ...p, [key]: checked } : p)
                        toast.success(`Préférence mise à jour`)
                      } catch {
                        toast.error('Erreur')
                      }
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: RÔLES ═══════════════ */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <Card
                key={role.name}
                className={`transition-shadow hover:shadow-md ${role.name === 'ADMIN' ? 'border-blue-200 dark:border-blue-800' :
                    role.name === 'AGENT' ? 'border-green-200 dark:border-green-800' :
                      'border-orange-200 dark:border-orange-800'
                  }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className={`h-5 w-5 ${role.name === 'ADMIN' ? 'text-blue-600' :
                          role.name === 'AGENT' ? 'text-green-600' :
                            'text-orange-600'
                        }`} />
                      {role.label}
                    </CardTitle>
                    <Badge variant="secondary">{role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        {categoryIcons[category]}
                        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{category}</span>
                      </div>
                      <div className="space-y-1.5 ml-6">
                        {perms.map(({ key, label }) => {
                          const isEditing = editingRole === role.name
                          const value = isEditing ? (editedPermissions[key] ?? role.permissions[key]) : role.permissions[key]
                          return (
                            <div key={key} className="flex items-center justify-between py-1">
                              <span className="text-sm">{label}</span>
                              {isEditing && role.name !== 'ADMIN' ? (
                                <Switch
                                  checked={value}
                                  onCheckedChange={v => setEditedPermissions({ ...editedPermissions, [key]: v })}
                                />
                              ) : (
                                <span className={`text-xs font-medium ${value ? 'text-green-600' : 'text-red-400'}`}>
                                  {value ? <Check className="h-4 w-4" /> : '—'}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {role.name !== 'ADMIN' && (
                    <Separator />
                  )}

                  {role.name !== 'ADMIN' && editingRole !== role.name && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEditingRole(role.name)
                        setEditedPermissions({ ...role.permissions })
                      }}
                    >
                      Modifier les permissions
                    </Button>
                  )}

                  {editingRole === role.name && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => saveRolePermissions(role.name)}
                        disabled={saving === 'roles'}
                      >
                        {saving === 'roles' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Sauvegarder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}