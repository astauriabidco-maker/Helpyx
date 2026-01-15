'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';

interface SearchFilters {
  recherche: string;
  status: string;
  categorie: string;
  priorite: string;
  type_panne: string;
  assignedTo: string;
  tag: string;
  dateDebut: string;
  dateFin: string;
  sortBy: string;
  sortOrder: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  loading?: boolean;
  resultCount?: number;
}

export function AdvancedSearch({ onFiltersChange, loading = false, resultCount = 0 }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    recherche: '',
    status: 'all',
    categorie: 'all',
    priorite: 'all',
    type_panne: 'all',
    assignedTo: 'all',
    tag: '',
    dateDebut: '',
    dateFin: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      recherche: '',
      status: 'all',
      categorie: 'all',
      priorite: 'all',
      type_panne: 'all',
      assignedTo: 'all',
      tag: '',
      dateDebut: '',
      dateFin: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== 'createdAt' && value !== 'desc'
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche Avancée
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} filtre(s) actif(s)
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Masquer' : 'Afficher'} filtres
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche principale */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par description, titre, marque, modèle..."
              value={filters.recherche}
              onChange={(e) => updateFilter('recherche', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
          >
            <X className="w-4 h-4 mr-2" />
            Effacer
          </Button>
        </div>

        {/* Filtres avancés */}
        {showAdvanced && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            {/* Statut */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Statut
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="OUVERT">Ouvert</SelectItem>
                  <SelectItem value="EN_DIAGNOSTIC">En diagnostic</SelectItem>
                  <SelectItem value="EN_REPARATION">En réparation</SelectItem>
                  <SelectItem value="REPARÉ">Réparé</SelectItem>
                  <SelectItem value="FERMÉ">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={filters.categorie}
                onValueChange={(value) => updateFilter('categorie', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="PC Portable">PC Portable</SelectItem>
                  <SelectItem value="PC Fixe">PC Fixe</SelectItem>
                  <SelectItem value="Serveur">Serveur</SelectItem>
                  <SelectItem value="Imprimante">Imprimante</SelectItem>
                  <SelectItem value="Réseau">Réseau</SelectItem>
                  <SelectItem value="Logiciel">Logiciel</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priorité */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Select
                value={filters.priorite}
                onValueChange={(value) => updateFilter('priorite', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="BASSE">Basse</SelectItem>
                  <SelectItem value="MOYENNE">Moyenne</SelectItem>
                  <SelectItem value="HAUTE">Haute</SelectItem>
                  <SelectItem value="CRITIQUE">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type de panne */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de panne</label>
              <Select
                value={filters.type_panne}
                onValueChange={(value) => updateFilter('type_panne', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="HARDWARE">Hardware</SelectItem>
                  <SelectItem value="SOFTWARE">Software</SelectItem>
                  <SelectItem value="RÉSEAU">Réseau</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignation */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignation
              </label>
              <Select
                value={filters.assignedTo}
                onValueChange={(value) => updateFilter('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les assignations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les assignations</SelectItem>
                  <SelectItem value="unassigned">Non assignés</SelectItem>
                  {/* Les agents seront chargés dynamiquement */}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="ex: GPU, RAM, urgent..."
                value={filters.tag}
                onChange={(e) => updateFilter('tag', e.target.value)}
              />
            </div>

            {/* Plage de dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date début
              </label>
              <Input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => updateFilter('dateDebut', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date fin</label>
              <Input
                type="date"
                value={filters.dateFin}
                onChange={(e) => updateFilter('dateFin', e.target.value)}
              />
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trier par</label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                    <SelectItem value="updatedAt">Date de mise à jour</SelectItem>
                    <SelectItem value="priorite">Priorité</SelectItem>
                    <SelectItem value="status">Statut</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">↓</SelectItem>
                    <SelectItem value="asc">↑</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {resultCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {loading ? 'Recherche en cours...' : `${resultCount} résultat(s) trouvé(s)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}