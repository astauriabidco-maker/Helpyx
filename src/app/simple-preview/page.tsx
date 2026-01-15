'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function SimplePreviewForm() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: '',
    priorite: 'moyenne'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const data = new FormData();
      data.append('titre', formData.titre);
      data.append('description', formData.description);
      data.append('categorie', formData.categorie);
      data.append('priorite', formData.priorite);

      console.log('🚀 Sending request to /api/tickets/advanced');
      
      const response = await fetch('/api/tickets/advanced', {
        method: 'POST',
        body: data
      });

      const responseData = await response.json();
      console.log('📥 Response received:', responseData);

      if (response.ok) {
        setResult(responseData);
        setFormData({
          titre: '',
          description: '',
          categorie: '',
          priorite: 'moyenne'
        });
      } else {
        setError(responseData.error || 'Erreur lors de la création du ticket');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Erreur réseau: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
            🚀 Preview Mode
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            Formulaire de Ticket (Preview)
          </h1>
          <p className="text-muted-foreground">
            Version simplifiée pour les environnements de preview
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer un Ticket</CardTitle>
            <CardDescription>
              Remplissez les champs ci-dessous pour créer un ticket de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du ticket *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="ex: Problème avec mon ordinateur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select 
                    value={formData.categorie} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorite">Priorité *</Label>
                  <Select 
                    value={formData.priorite} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priorite: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="moyenne">Moyenne</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="critique">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.titre || !formData.description || !formData.categorie}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer le ticket'
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Erreur:</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Succès!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Ticket #{result.ticket?.id} créé avec succès!
                </p>
                <div className="mt-2 text-xs text-green-600">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}