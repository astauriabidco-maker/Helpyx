'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
    BookOpen,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    User,
    AlertCircle,
    Tag,
    FileText,
    Globe,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Article {
    id: string;
    titre: string;
    contenu: string;
    resume: string | null;
    categorie: string | null;
    tags: string[];
    difficulte: string;
    tempsLecture: number;
    ordre: number;
    publie: boolean;
    vues: number;
    votesPositifs: number;
    votesNegatifs: number;
    createdAt: string;
    updatedAt: string;
    auteur: { id: string; name: string | null; email: string } | null;
}

interface ArticleFormData {
    titre: string;
    contenu: string;
    resume: string;
    categorie: string;
    tags: string;
    difficulte: string;
    tempsLecture: number;
    publie: boolean;
}

const EMPTY_FORM: ArticleFormData = {
    titre: '',
    contenu: '',
    resume: '',
    categorie: '',
    tags: '',
    difficulte: 'MOYEN',
    tempsLecture: 5,
    publie: false,
};

const CATEGORIES = [
    'Dépannage', 'Installation', 'Configuration', 'Réseau',
    'Sécurité', 'Maintenance', 'FAQ', 'Tutoriel', 'Guide'
];

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    'FACILE': { label: 'Facile', color: 'bg-green-100 text-green-800', icon: '🟢' },
    'MOYEN': { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    'DIFFICILE': { label: 'Difficile', color: 'bg-red-100 text-red-800', icon: '🔴' },
};

export default function AdminArticlesPage() {
    const { data: session } = useSession();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

    // Filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [categorieFilter, setCategorieFilter] = useState('all');
    const [difficulteFilter, setDifficulteFilter] = useState('all');
    const [publishedFilter, setPublishedFilter] = useState('all');

    // Dialogues
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState<ArticleFormData>(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchArticles = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (searchTerm) params.set('recherche', searchTerm);
            if (categorieFilter !== 'all') params.set('categorie', categorieFilter);
            if (difficulteFilter !== 'all') params.set('difficulte', difficulteFilter);
            if (publishedFilter !== 'all') params.set('publie', publishedFilter);

            const res = await fetch(`/api/articles?${params.toString()}`);
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();

            setArticles(data.articles || []);
            setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des articles');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, categorieFilter, difficulteFilter, publishedFilter]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Création
    const handleCreate = async () => {
        if (!formData.titre || !formData.contenu) {
            toast.error('Le titre et le contenu sont obligatoires');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titre: formData.titre,
                    contenu: formData.contenu,
                    resume: formData.resume || undefined,
                    categorie: formData.categorie || undefined,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    difficulte: formData.difficulte,
                    tempsLecture: formData.tempsLecture,
                    publie: formData.publie,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur de création');
            }

            toast.success(`Article "${formData.titre}" créé`);
            setIsCreateOpen(false);
            setFormData(EMPTY_FORM);
            fetchArticles();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la création');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Modification
    const handleEdit = async () => {
        if (!selectedArticle || !formData.titre || !formData.contenu) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/articles/${selectedArticle.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titre: formData.titre,
                    contenu: formData.contenu,
                    resume: formData.resume || undefined,
                    categorie: formData.categorie || undefined,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    difficulte: formData.difficulte,
                    tempsLecture: formData.tempsLecture,
                    publie: formData.publie,
                }),
            });

            if (!res.ok) throw new Error('Erreur de mise à jour');

            toast.success(`Article "${formData.titre}" mis à jour`);
            setIsEditOpen(false);
            setSelectedArticle(null);
            fetchArticles();
        } catch {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Suppression
    const handleDelete = async () => {
        if (!selectedArticle) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/articles/${selectedArticle.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Erreur');

            toast.success(`Article supprimé`);
            setIsDeleteOpen(false);
            setSelectedArticle(null);
            fetchArticles();
        } catch {
            toast.error('Erreur lors de la suppression');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle publié
    const togglePublished = async (article: Article) => {
        try {
            const res = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publie: !article.publie }),
            });
            if (!res.ok) throw new Error('Erreur');
            toast.success(`Article ${!article.publie ? 'publié' : 'dépublié'}`);
            fetchArticles(pagination.page);
        } catch {
            toast.error('Erreur lors de la modification');
        }
    };

    const openEditDialog = (article: Article) => {
        setSelectedArticle(article);
        setFormData({
            titre: article.titre,
            contenu: article.contenu,
            resume: article.resume || '',
            categorie: article.categorie || '',
            tags: (article.tags || []).join(', '),
            difficulte: article.difficulte || 'MOYEN',
            tempsLecture: article.tempsLecture || 5,
            publie: article.publie,
        });
        setIsEditOpen(true);
    };

    const openViewDialog = (article: Article) => {
        setSelectedArticle(article);
        setIsViewOpen(true);
    };

    const openDeleteDialog = (article: Article) => {
        setSelectedArticle(article);
        setIsDeleteOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Stats
    const stats = {
        total: pagination.total,
        published: articles.filter(a => a.publie).length,
        drafts: articles.filter(a => !a.publie).length,
        categories: [...new Set(articles.map(a => a.categorie).filter(Boolean))].length,
    };

    // Formulaire partagé
    const renderForm = () => (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <Label>Titre *</Label>
                <Input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Comment résoudre l'erreur BSoD"
                />
            </div>
            <div>
                <Label>Résumé</Label>
                <Textarea
                    value={formData.resume}
                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                    placeholder="Bref résumé de l'article..."
                    rows={2}
                />
            </div>
            <div>
                <Label>Contenu *</Label>
                <Textarea
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    placeholder="Contenu détaillé de l'article (supporte le Markdown)"
                    rows={10}
                    className="font-mono text-sm"
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
                    <Label>Difficulté</Label>
                    <Select value={formData.difficulte} onValueChange={(v) => setFormData({ ...formData, difficulte: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FACILE">🟢 Facile</SelectItem>
                            <SelectItem value="MOYEN">🟡 Moyen</SelectItem>
                            <SelectItem value="DIFFICILE">🔴 Difficile</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Temps de lecture (min)</Label>
                    <Input
                        type="number"
                        min={1}
                        value={formData.tempsLecture}
                        onChange={(e) => setFormData({ ...formData, tempsLecture: parseInt(e.target.value) || 5 })}
                    />
                </div>
                <div>
                    <Label>Tags (séparés par virgules)</Label>
                    <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="bsod, windows, hardware"
                    />
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                    <p className="text-sm font-medium">Publier</p>
                    <p className="text-xs text-muted-foreground">Rendre visible aux utilisateurs</p>
                </div>
                <Switch
                    checked={formData.publie}
                    onCheckedChange={(checked) => setFormData({ ...formData, publie: checked })}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="h-8 w-8" />
                        Knowledge Base
                    </h1>
                    <p className="text-muted-foreground">
                        {pagination.total} article{pagination.total > 1 ? 's' : ''} dans la base de connaissances
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchArticles(pagination.page)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setFormData(EMPTY_FORM)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvel article
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Créer un article</DialogTitle>
                                <DialogDescription>Ajoutez un article à la base de connaissances</DialogDescription>
                            </DialogHeader>
                            {renderForm()}
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md" onClick={() => setPublishedFilter(publishedFilter === 'true' ? 'all' : 'true')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Publiés</CardTitle>
                        <Globe className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md" onClick={() => setPublishedFilter(publishedFilter === 'false' ? 'all' : 'false')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
                        <EyeOff className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.drafts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Catégories</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categories}</div>
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
                                    placeholder="Rechercher un article..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={difficulteFilter} onValueChange={setDifficulteFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Difficulté" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                <SelectItem value="FACILE">🟢 Facile</SelectItem>
                                <SelectItem value="MOYEN">🟡 Moyen</SelectItem>
                                <SelectItem value="DIFFICILE">🔴 Difficile</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des articles */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-muted-foreground">Chargement...</span>
                </div>
            ) : articles.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-1">Aucun article trouvé</h3>
                        <p className="text-muted-foreground text-sm">
                            {searchTerm || categorieFilter !== 'all' ? 'Aucun article ne correspond aux filtres.' : 'Commencez par créer un article.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((article) => {
                        const diffConf = DIFFICULTY_CONFIG[article.difficulte] || DIFFICULTY_CONFIG['MOYEN'];
                        return (
                            <Card key={article.id} className="hover:shadow-md transition-shadow group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-base truncate cursor-pointer hover:text-blue-600" onClick={() => openViewDialog(article)}>
                                                    {article.titre}
                                                </h3>
                                                {!article.publie && (
                                                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 flex-shrink-0">
                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                        Brouillon
                                                    </Badge>
                                                )}
                                            </div>
                                            {article.resume && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.resume}</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <Badge className={`${diffConf.color} text-xs`}>
                                                    {diffConf.icon} {diffConf.label}
                                                </Badge>
                                                {article.categorie && (
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-3 w-3" />{article.categorie}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />{article.tempsLecture} min
                                                </span>
                                                {article.auteur && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />{article.auteur.name || article.auteur.email}
                                                    </span>
                                                )}
                                                <span>{formatDate(article.createdAt)}</span>
                                            </div>
                                            {article.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {article.tags.map((tag: string) => (
                                                        <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <Switch
                                                checked={article.publie}
                                                onCheckedChange={() => togglePublished(article)}
                                                title={article.publie ? 'Dépublier' : 'Publier'}
                                            />
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openViewDialog(article)} title="Voir">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(article)} title="Modifier">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => openDeleteDialog(article)}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} sur {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchArticles(pagination.page - 1)}>
                            <ChevronLeft className="h-4 w-4 mr-1" />Précédent
                        </Button>
                        <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchArticles(pagination.page + 1)}>
                            Suivant<ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialog Modifier */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;article</DialogTitle>
                        <DialogDescription>{selectedArticle?.titre}</DialogDescription>
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

            {/* Dialog Voir */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedArticle?.titre}</DialogTitle>
                        <DialogDescription>
                            {selectedArticle && (
                                <div className="flex items-center gap-3 mt-2">
                                    {selectedArticle.categorie && <Badge variant="outline">{selectedArticle.categorie}</Badge>}
                                    <Badge className={DIFFICULTY_CONFIG[selectedArticle.difficulte]?.color}>
                                        {DIFFICULTY_CONFIG[selectedArticle.difficulte]?.icon} {DIFFICULTY_CONFIG[selectedArticle.difficulte]?.label}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-xs">
                                        <Clock className="h-3 w-3" />{selectedArticle.tempsLecture} min
                                    </span>
                                    <Badge variant={selectedArticle.publie ? 'default' : 'outline'}>
                                        {selectedArticle.publie ? 'Publié' : 'Brouillon'}
                                    </Badge>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedArticle && (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            {selectedArticle.resume && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 mb-4">
                                    <p className="text-sm italic">{selectedArticle.resume}</p>
                                </div>
                            )}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedArticle.contenu}</div>
                            {selectedArticle.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t">
                                    {selectedArticle.tags.map((tag: string) => (
                                        <Badge key={tag} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                Par {selectedArticle.auteur?.name || 'Anonyme'} — {formatDate(selectedArticle.createdAt)}
                                {selectedArticle.updatedAt !== selectedArticle.createdAt && ` (modifié le ${formatDate(selectedArticle.updatedAt)})`}
                            </div>
                        </div>
                    )}
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
                            Supprimer <strong>{selectedArticle?.titre}</strong> ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
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
