'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Lightbulb,
  Clock,
  Star,
  MessageCircle
} from 'lucide-react';

interface Article {
  id: string;
  titre: string;
  contenu: string;
  resume?: string;
  categorie?: string;
  tags: string[];
  difficulte: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  tempsLecture: number;
  ordre: number;
  publie: boolean;
  auteur?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  articles: Article[];
  aiSuggestion?: string;
  searchExpanded: boolean;
  originalQuery: string;
  suggestedKeywords?: string[];
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [difficulteFilter, setDifficulteFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    resume: '',
    categorie: '',
    tags: '',
    difficulte: 'MOYEN' as const,
    tempsLecture: 5,
    ordre: 0,
    publie: false
  });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categorieFilter && categorieFilter !== 'all') params.append('categorie', categorieFilter);
      if (difficulteFilter && difficulteFilter !== 'all') params.append('difficulte', difficulteFilter);
      params.append('publie', 'true');

      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchArticles = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      if (categorieFilter && categorieFilter !== 'all') params.append('categorie', categorieFilter);
      if (difficulteFilter && difficulteFilter !== 'all') params.append('difficulte', difficulteFilter);

      const response = await fetch(`/api/articles/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
        setIsSearchMode(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          titre: '',
          contenu: '',
          resume: '',
          categorie: '',
          tags: '',
          difficulte: 'MOYEN',
          tempsLecture: 5,
          ordre: 0,
          publie: false
        });
        fetchArticles();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
    }
  };

  useEffect(() => {
    if (!isSearchMode) {
      fetchArticles();
    }
  }, [categorieFilter, difficulteFilter, isSearchMode]);

  const getDifficulteBadge = (difficulte: string) => {
    const variants = {
      FACILE: 'default',
      MOYEN: 'secondary',
      DIFFICILE: 'destructive'
    } as const;

    return (
      <Badge variant={variants[difficulte as keyof typeof variants]}>
        {difficulte}
      </Badge>
    );
  };

  const displayArticles = isSearchMode ? searchResult?.articles || [] : articles;

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Base de Connaissances
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                      placeholder="ex: Comment tester une RAM défectueuse"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resume">Résumé</Label>
                    <Input
                      id="resume"
                      value={formData.resume}
                      onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                      placeholder="Brève description de l'article"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categorie">Catégorie</Label>
                      <Select value={formData.categorie} onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Réseau">Réseau</SelectItem>
                          <SelectItem value="Sécurité">Sécurité</SelectItem>
                          <SelectItem value="Backup">Backup</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulte">Difficulté</Label>
                      <Select value={formData.difficulte} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulte: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FACILE">Facile</SelectItem>
                          <SelectItem value="MOYEN">Moyen</SelectItem>
                          <SelectItem value="DIFFICILE">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempsLecture">Temps de lecture (minutes)</Label>
                      <Input
                        id="tempsLecture"
                        type="number"
                        value={formData.tempsLecture}
                        onChange={(e) => setFormData(prev => ({ ...prev, tempsLecture: parseInt(e.target.value) || 5 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="RAM, test, diagnostic"
                      />
                    </div>
                  <div>
                  </div>
                    <Label htmlFor="contenu">Contenu *</Label>
                    <Textarea
                      id="contenu"
                      value={formData.contenu}
                      onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                      placeholder="Contenu détaillé de l'article (Markdown ou HTML)"
                      rows={8}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="publie"
                      checked={formData.publie}
                      onChange={(e) => setFormData(prev => ({ ...prev, publie: e.target.checked }))}
                    />
                    <Label htmlFor="publie">Publier immédiatement</Label>
                  </div>
                  <Button onClick={createArticle} className="w-full">
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
                placeholder="Rechercher un article, une solution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchArticles()}
                className="pl-10"
              />
            </div>
            <Button onClick={searchArticles} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
            {isSearchMode && (
              <Button variant="outline" onClick={() => {
                setIsSearchMode(false);
                setSearchQuery('');
                setSearchResult(null);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Voir tout
              </Button>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Réseau">Réseau</SelectItem>
                <SelectItem value="Sécurité">Sécurité</SelectItem>
                <SelectItem value="Backup">Backup</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficulteFilter} onValueChange={setDifficulteFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les difficultés</SelectItem>
                <SelectItem value="FACILE">Facile</SelectItem>
                <SelectItem value="MOYEN">Moyen</SelectItem>
                <SelectItem value="DIFFICILE">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suggestion IA */}
          {isSearchMode && searchResult?.aiSuggestion && (
            <Card className="mb-4 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Suggestion IA</div>
                    <div className="text-sm text-blue-800 mt-1">{searchResult.aiSuggestion}</div>
                    {searchResult.suggestedKeywords && (
                      <div className="flex gap-2 mt-2">
                        {searchResult.suggestedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des articles */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : displayArticles.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isSearchMode ? 'Aucun article trouvé pour votre recherche' : 'Aucun article publié'}
                </p>
              </div>
            ) : (
              displayArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{article.titre}</h3>
                          {getDifficulteBadge(article.difficulte)}
                        </div>
                        
                        {article.resume && (
                          <p className="text-muted-foreground mb-2">{article.resume}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.tempsLecture} min
                          </div>
                          {article.categorie && (
                            <Badge variant="outline">{article.categorie}</Badge>
                          )}
                          {article.auteur && (
                            <span>Par {article.auteur.name}</span>
                          )}
                        </div>

                        {article.tags.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {article.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lire
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour afficher un article */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedArticle.titre}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getDifficulteBadge(selectedArticle.difficulte)}
                  {selectedArticle.categorie && (
                    <Badge variant="outline">{selectedArticle.categorie}</Badge>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedArticle.tempsLecture} min de lecture
                  </div>
                </div>

                {selectedArticle.tags.length > 0 && (
                  <div className="flex gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.contenu }}
                    className="whitespace-pre-wrap"
                  />
                </div>

                {selectedArticle.auteur && (
                  <div className="text-sm text-muted-foreground pt-4 border-t">
                    Article écrit par {selectedArticle.auteur.name} ({selectedArticle.auteur.email})
                    <br />
                    Créé le {new Date(selectedArticle.createdAt).toLocaleDateString('fr-FR')}
                    {selectedArticle.updatedAt !== selectedArticle.createdAt && 
                      ` • Modifié le ${new Date(selectedArticle.updatedAt).toLocaleDateString('fr-FR')}`
                    }
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}