'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  MapPin,
  Hash,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  nom: string;
  reference?: string;
  description?: string;
  categorie?: string;
  quantite: number;
  seuilAlerte: number;
  coutUnitaire?: number;
  fournisseur?: string;
  emplacement?: string;
  ticketItems: any[];
  restockOrders: any[];
}

interface InventoryFormData {
  nom: string;
  reference: string;
  description: string;
  categorie: string;
  quantite: number;
  seuilAlerte: number;
  coutUnitaire: number;
  fournisseur: string;
  emplacement: string;
}

const EMPTY_FORM: InventoryFormData = {
  nom: '',
  reference: '',
  description: '',
  categorie: '',
  quantite: 0,
  seuilAlerte: 5,
  coutUnitaire: 0,
  fournisseur: '',
  emplacement: '',
};

const CATEGORIES = [
  'RAM', 'CPU', 'GPU', 'SSD', 'HDD',
  'Carte Mère', 'Alimentation', 'Refroidissement',
  'Câble', 'Écran', 'Clavier', 'Souris',
  'Imprimante', 'Réseau', 'Autre'
];

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // Dialogues
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('recherche', searchTerm);
      if (categorieFilter && categorieFilter !== 'all') params.append('categorie', categorieFilter);
      if (showLowStock) params.append('stockBas', 'true');

      const response = await fetch(`/api/inventory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      } else {
        toast.error('Erreur lors du chargement du stock');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categorieFilter, showLowStock]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Création
  const handleCreate = async () => {
    if (!formData.nom) {
      toast.error('Le nom est obligatoire');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (!payload.reference) delete payload.reference;
      if (!payload.description) delete payload.description;
      if (!payload.categorie) delete payload.categorie;
      if (!payload.fournisseur) delete payload.fournisseur;
      if (!payload.emplacement) delete payload.emplacement;

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const data = await res.json();
        toast.error(data.error || 'Référence en double');
        return;
      }
      if (!res.ok) throw new Error('Erreur serveur');

      toast.success(`Article "${formData.nom}" ajouté au stock`);
      setIsCreateOpen(false);
      setFormData(EMPTY_FORM);
      fetchInventory();
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modification
  const handleEdit = async () => {
    if (!selectedItem || !formData.nom) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          reference: formData.reference || undefined,
          description: formData.description || undefined,
          categorie: formData.categorie || undefined,
          quantite: formData.quantite,
          seuilAlerte: formData.seuilAlerte,
          coutUnitaire: formData.coutUnitaire || undefined,
          fournisseur: formData.fournisseur || undefined,
          emplacement: formData.emplacement || undefined,
        }),
      });

      if (res.status === 400) {
        const data = await res.json();
        toast.error(data.error || 'Erreur de validation');
        return;
      }
      if (!res.ok) throw new Error('Erreur');

      toast.success(`Article "${formData.nom}" mis à jour`);
      setIsEditOpen(false);
      setSelectedItem(null);
      fetchInventory();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression
  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'DELETE',
      });

      if (res.status === 400) {
        const data = await res.json();
        toast.error(data.error || 'Impossible de supprimer cet article');
        return;
      }
      if (!res.ok) throw new Error('Erreur');

      toast.success(`Article "${selectedItem.nom}" supprimé`);
      setIsDeleteOpen(false);
      setSelectedItem(null);
      fetchInventory();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adjust quantity inline
  const adjustQuantity = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantite + delta);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantite: newQty }),
      });
      if (!res.ok) throw new Error('Erreur');
      fetchInventory();
    } catch {
      toast.error('Erreur lors de la modification de la quantité');
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      nom: item.nom,
      reference: item.reference || '',
      description: item.description || '',
      categorie: item.categorie || '',
      quantite: item.quantite,
      seuilAlerte: item.seuilAlerte,
      coutUnitaire: item.coutUnitaire || 0,
      fournisseur: item.fournisseur || '',
      emplacement: item.emplacement || '',
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  // Commande automatique
  const triggerAutoOrder = async () => {
    try {
      const response = await fetch('/api/inventory/auto-order', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.message} — ${data.autoOrders?.length || 0} commande(s) créée(s)`);
        fetchInventory();
      } else {
        toast.error('Erreur lors de la commande automatique');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  const lowStockItems = items.filter(item => item.quantite <= item.seuilAlerte);
  const outOfStock = items.filter(item => item.quantite === 0);
  const totalValue = items.reduce((sum, item) => sum + (item.quantite * (item.coutUnitaire || 0)), 0);
  const categories = [...new Set(items.map(item => item.categorie).filter(Boolean))];

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantite === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (item.quantite <= item.seuilAlerte) {
      return <Badge className="bg-amber-100 text-amber-800">Stock bas</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">En stock</Badge>;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchInventory();
  };

  // Formulaire partagé (create & edit)
  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nom *</Label>
          <Input
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="DDR4 RAM 16GB"
          />
        </div>
        <div>
          <Label>Référence</Label>
          <Input
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="RAM-DDR4-16G"
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description de l'article..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Catégorie</Label>
          <Select value={formData.categorie || 'none'} onValueChange={(v) => setFormData({ ...formData, categorie: v === 'none' ? '' : v })}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fournisseur</Label>
          <Input
            value={formData.fournisseur}
            onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
            placeholder="PC Expert"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Quantité *</Label>
          <Input
            type="number"
            min={0}
            value={formData.quantite}
            onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Seuil d&apos;alerte</Label>
          <Input
            type="number"
            min={0}
            value={formData.seuilAlerte}
            onChange={(e) => setFormData({ ...formData, seuilAlerte: parseInt(e.target.value) || 5 })}
          />
        </div>
        <div>
          <Label>Coût unitaire (€)</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={formData.coutUnitaire}
            onChange={(e) => setFormData({ ...formData, coutUnitaire: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div>
        <Label>Emplacement</Label>
        <Input
          value={formData.emplacement}
          onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
          placeholder="Allée A, Étagère 3"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">{categories.length} catégorie(s)</p>
          </CardContent>
        </Card>

        <Card className={lowStockItems.length > 0 ? 'border-amber-300' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems.length}</div>
            {outOfStock.length > 0 && (
              <p className="text-xs text-red-500 font-medium">{outOfStock.length} en rupture</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Auto</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={triggerAutoOrder} size="sm" className="w-full" disabled={lowStockItems.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Lancer ({lowStockItems.length})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestion du Stock
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setFormData(EMPTY_FORM)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel article</DialogTitle>
                  <DialogDescription>Ajoutez une pièce ou un consommable au stock</DialogDescription>
                </DialogHeader>
                {renderForm()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                  <Button onClick={handleCreate} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer l&apos;article
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
              />
            </div>
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat || ''}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stock bas
            </Button>
          </div>

          {/* Tableau du stock */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Seuil</TableHead>
                <TableHead>Coût U.</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Aucun article trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nom}</div>
                        {item.reference && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="h-3 w-3" />{item.reference}
                          </div>
                        )}
                        {item.emplacement && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{item.emplacement}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.categorie ? (
                        <Badge variant="outline" className="text-xs">{item.categorie}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => adjustQuantity(item, -1)}
                          disabled={item.quantite === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className={`font-medium min-w-[2rem] text-center ${item.quantite <= item.seuilAlerte ? 'text-red-600' : ''}`}>
                          {item.quantite}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => adjustQuantity(item, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.seuilAlerte}</TableCell>
                    <TableCell>
                      {item.coutUnitaire
                        ? `${item.coutUnitaire.toFixed(2)}€`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.coutUnitaire
                        ? `${(item.quantite * item.coutUnitaire).toFixed(2)}€`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-sm">{item.fournisseur || '-'}</TableCell>
                    <TableCell>{getStockBadge(item)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteDialog(item)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Modifier */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;article</DialogTitle>
            <DialogDescription>{selectedItem?.reference || selectedItem?.nom}</DialogDescription>
          </DialogHeader>
          {renderForm()}
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
              Supprimer l&apos;article
            </DialogTitle>
            <DialogDescription>
              Supprimer <strong>{selectedItem?.nom}</strong> du stock ?
              {selectedItem?.reference && <span className="block text-xs mt-1">Réf: {selectedItem.reference}</span>}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && selectedItem.ticketItems?.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-800">⚠️ Article utilisé</p>
              <p className="text-amber-700 mt-1">
                Cet article est lié à {selectedItem.ticketItems.length} ticket(s).
                La suppression sera bloquée.
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