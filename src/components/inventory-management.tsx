'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart, 
  TrendingUp,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

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
  reference?: string;
  description?: string;
  categorie?: string;
  quantite: number;
  seuilAlerte: number;
  coutUnitaire?: number;
  fournisseur?: string;
  emplacement?: string;
}

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InventoryFormData>({
    nom: '',
    reference: '',
    description: '',
    categorie: '',
    quantite: 0,
    seuilAlerte: 5,
    coutUnitaire: 0,
    fournisseur: '',
    emplacement: ''
  });

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('recherche', searchTerm);
      if (categorieFilter && categorieFilter !== 'all') params.append('categorie', categorieFilter);
      if (showLowStock) params.append('stockBas', 'true');

      const response = await fetch(`/api/inventory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          nom: '',
          reference: '',
          description: '',
          categorie: '',
          quantite: 0,
          seuilAlerte: 5,
          coutUnitaire: 0,
          fournisseur: '',
          emplacement: ''
        });
        fetchInventory();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
    }
  };

  const triggerAutoOrder = async () => {
    try {
      const response = await fetch('/api/inventory/auto-order', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.message}\n${data.autoOrders.length} commande(s) créée(s)`);
        fetchInventory();
      }
    } catch (error) {
      console.error('Erreur lors de la commande automatique:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, categorieFilter, showLowStock]);

  const lowStockItems = items.filter(item => item.quantite <= item.seuilAlerte);
  const totalValue = items.reduce((sum, item) => sum + (item.quantite * (item.coutUnitaire || 0)), 0);
  const categories = [...new Set(items.map(item => item.categorie).filter(Boolean))];

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantite === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (item.quantite <= item.seuilAlerte) {
      return <Badge variant="secondary">Stock bas</Badge>;
    } else {
      return <Badge variant="default">En stock</Badge>;
    }
  };

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Auto</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={triggerAutoOrder} size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Lancer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestion du Stock
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="ex: DDR4 RAM 16GB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="ex: RAM-DDR4-16G"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={formData.categorie} onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RAM">RAM</SelectItem>
                        <SelectItem value="CPU">CPU</SelectItem>
                        <SelectItem value="GPU">GPU</SelectItem>
                        <SelectItem value="SSD">SSD</SelectItem>
                        <SelectItem value="HDD">HDD</SelectItem>
                        <SelectItem value="Carte Mère">Carte Mère</SelectItem>
                        <SelectItem value="Alimentation">Alimentation</SelectItem>
                        <SelectItem value="Refroidissement">Refroidissement</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantite">Quantité *</Label>
                      <Input
                        id="quantite"
                        type="number"
                        value={formData.quantite}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seuilAlerte">Seuil d'alerte *</Label>
                      <Input
                        id="seuilAlerte"
                        type="number"
                        value={formData.seuilAlerte}
                        onChange={(e) => setFormData(prev => ({ ...prev, seuilAlerte: parseInt(e.target.value) || 5 }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coutUnitaire">Coût unitaire (€)</Label>
                      <Input
                        id="coutUnitaire"
                        type="number"
                        step="0.01"
                        value={formData.coutUnitaire}
                        onChange={(e) => setFormData(prev => ({ ...prev, coutUnitaire: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fournisseur">Fournisseur</Label>
                      <Input
                        id="fournisseur"
                        value={formData.fournisseur}
                        onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                        placeholder="ex: Fournisseur A"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="emplacement">Emplacement</Label>
                    <Input
                      id="emplacement"
                      value={formData.emplacement}
                      onChange={(e) => setFormData(prev => ({ ...prev, emplacement: e.target.value }))}
                      placeholder="ex: Allée A, Étagère 3"
                    />
                  </div>
                  <Button onClick={createItem} className="w-full">
                    Créer l'article
                  </Button>
                </div>
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                <TableHead>Valeur</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nom}</div>
                        {item.reference && (
                          <div className="text-sm text-muted-foreground">{item.reference}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.categorie || '-'}</TableCell>
                    <TableCell>
                      <span className={item.quantite <= item.seuilAlerte ? 'text-destructive font-medium' : ''}>
                        {item.quantite}
                      </span>
                    </TableCell>
                    <TableCell>{item.seuilAlerte}</TableCell>
                    <TableCell>
                      {item.coutUnitaire 
                        ? `${(item.quantite * item.coutUnitaire).toFixed(2)}€`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{item.fournisseur || '-'}</TableCell>
                    <TableCell>{getStockBadge(item)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
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
    </div>
  );
}