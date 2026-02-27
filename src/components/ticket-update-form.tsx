'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Edit,
  Save,
  X,
  User,
  Tag,
  AlertTriangle,
  Clock,
  Monitor,
  Smartphone,
  Laptop,
  Printer,
  Wifi,
  Settings
} from 'lucide-react';

interface Ticket {
  id: number;
  titre?: string;
  description: string;
  status: string;
  priorite: string;
  type_panne?: string;
  categorie?: string;
  equipement_type?: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  numero_inventaire?: string;
  assignedToId?: string;
  tags?: string[];
  garantie?: boolean;
  acces_distant?: boolean;
  notification_email?: boolean;
  notification_sms?: boolean;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  activeTickets: number;
  displayName: string;
}

interface TicketUpdateFormProps {
  ticket: Ticket;
  agents: Agent[];
  onUpdate: (updatedTicket: Ticket) => void;
  onCancel: () => void;
  currentUserId: string;
  currentUserRole: string;
}

const EQUIPMENT_ICONS = {
  'Ordinateur portable': <Laptop className="h-4 w-4" />,
  'Ordinateur de bureau': <Monitor className="h-4 w-4" />,
  'Smartphone': <Smartphone className="h-4 w-4" />,
  'Imprimante': <Printer className="h-4 w-4" />,
  'Réseau': <Wifi className="h-4 w-4" />,
  'Autre': <Settings className="h-4 w-4" />,
};

const CATEGORIES = [
  'Panne hardware',
  'Problème logiciel',
  'Problème réseau',
  'Périphérique',
  'Serveur',
  'Application',
  'Sécurité',
  'Autre'
];

const TAGS_SUGGESTES = [
  'GPU', 'Écran', 'Clavier', 'Souris', 'RAM', 'Disque dur', 'SSD',
  'Windows', 'MacOS', 'Linux', 'Office', 'Adobe', 'VPN', 'WiFi',
  'Imprimante', 'Scanner', 'Moniteur', 'Câble', 'Alimentation'
];

export function TicketUpdateForm({
  ticket,
  agents,
  onUpdate,
  onCancel,
  currentUserId,
  currentUserRole
}: TicketUpdateFormProps) {
  const [formData, setFormData] = useState<Partial<Ticket>>({
    titre: ticket.titre || '',
    description: ticket.description,
    status: ticket.status,
    priorite: ticket.priorite,
    type_panne: ticket.type_panne || '',
    categorie: ticket.categorie || '',
    equipement_type: ticket.equipement_type || '',
    marque: ticket.marque || '',
    modele: ticket.modele || '',
    numero_serie: ticket.numero_serie || '',
    numero_inventaire: ticket.numero_inventaire || '',
    assignedToId: ticket.assignedToId || '',
    tags: ticket.tags || [],
    garantie: ticket.garantie || false,
    acces_distant: ticket.acces_distant || false,
    notification_email: ticket.notification_email !== false,
    notification_sms: ticket.notification_sms || false,
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.ticket);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'OUVERT': 'bg-red-100 text-red-800',
      'EN_DIAGNOSTIC': 'bg-yellow-100 text-yellow-800',
      'EN_REPARATION': 'bg-blue-100 text-blue-800',
      'REPARÉ': 'bg-green-100 text-green-800',
      'FERMÉ': 'bg-gray-100 text-gray-800',
      'ANNULÉ': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'BASSE': 'bg-green-100 text-green-800',
      'MOYENNE': 'bg-yellow-100 text-yellow-800',
      'HAUTE': 'bg-orange-100 text-orange-800',
      'CRITIQUE': 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Mettre à jour le ticket #{ticket.id}
            </CardTitle>
            <CardDescription>
              Modifiez les informations du ticket
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Statut et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUVERT">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Ouvert
                    </div>
                  </SelectItem>
                  <SelectItem value="EN_DIAGNOSTIC">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      En diagnostic
                    </div>
                  </SelectItem>
                  <SelectItem value="EN_REPARATION">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-500" />
                      En réparation
                    </div>
                  </SelectItem>
                  <SelectItem value="REPARÉ">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full" />
                      Réparé
                    </div>
                  </SelectItem>
                  <SelectItem value="FERMÉ">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-500 rounded-full" />
                      Fermé
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorite">Priorité</Label>
              <Select value={formData.priorite} onValueChange={(value) => handleInputChange('priorite', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASSE">Basse</SelectItem>
                  <SelectItem value="MOYENNE">Moyenne</SelectItem>
                  <SelectItem value="HAUTE">Haute</SelectItem>
                  <SelectItem value="CRITIQUE">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
                placeholder="Titre du ticket"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Description détaillée du problème"
              />
            </div>
          </div>

          {/* Catégorie et Type de panne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <Select value={formData.categorie} onValueChange={(value) => handleInputChange('categorie', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((categorie) => (
                    <SelectItem key={categorie} value={categorie}>
                      {categorie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_panne">Type de panne</Label>
              <Select value={formData.type_panne} onValueChange={(value) => handleInputChange('type_panne', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HARDWARE">Hardware</SelectItem>
                  <SelectItem value="SOFTWARE">Logiciel</SelectItem>
                  <SelectItem value="RÉSEAU">Réseau</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations sur l'équipement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations sur l'équipement</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipement_type">Type d'équipement</Label>
                <Input
                  id="equipement_type"
                  value={formData.equipement_type}
                  onChange={(e) => handleInputChange('equipement_type', e.target.value)}
                  placeholder="ex: Ordinateur portable, Imprimante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marque">Marque</Label>
                <Input
                  id="marque"
                  value={formData.marque}
                  onChange={(e) => handleInputChange('marque', e.target.value)}
                  placeholder="ex: Dell, HP, Lenovo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modele">Modèle</Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => handleInputChange('modele', e.target.value)}
                  placeholder="ex: XPS 15, EliteBook 840"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_serie">Numéro de série</Label>
                <Input
                  id="numero_serie"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                  placeholder="Numéro de série de l'équipement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_inventaire">Numéro d'inventaire</Label>
                <Input
                  id="numero_inventaire"
                  value={formData.numero_inventaire}
                  onChange={(e) => handleInputChange('numero_inventaire', e.target.value)}
                  placeholder="Numéro d'inventaire interne"
                />
              </div>
            </div>
          </div>

          {/* Assignation */}
          {(currentUserRole === 'AGENT' || currentUserRole === 'ADMIN') && (
            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assigner à</Label>
              <Select value={formData.assignedToId} onValueChange={(value) => handleInputChange('assignedToId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agent">
                    {formData.assignedToId && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {agents.find(a => a.id === formData.assignedToId)?.displayName}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Non assigné</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{agent.displayName}</span>
                        <Badge variant="outline" className="ml-2">
                          {agent.activeTickets} actifs
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {TAGS_SUGGESTES.filter(tag => !formData.tags?.includes(tag)).slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInputChange('tags', [...(formData.tags || []), tag])}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Options</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="garantie"
                checked={formData.garantie}
                onCheckedChange={(checked) => handleInputChange('garantie', checked)}
              />
              <Label htmlFor="garantie">Sous garantie</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acces_distant"
                checked={formData.acces_distant}
                onCheckedChange={(checked) => handleInputChange('acces_distant', checked)}
              />
              <Label htmlFor="acces_distant">Accès distant autorisé</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notification_email"
                checked={formData.notification_email}
                onCheckedChange={(checked) => handleInputChange('notification_email', checked)}
              />
              <Label htmlFor="notification_email">Notifications par email</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notification_sms"
                checked={formData.notification_sms}
                onCheckedChange={(checked) => handleInputChange('notification_sms', checked)}
              />
              <Label htmlFor="notification_sms">Notifications par SMS</Label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}