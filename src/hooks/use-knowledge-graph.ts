import { useState, useEffect, useCallback } from 'react';
import { SearchResult, GraphInsight, ContextualSearchQuery, LearningData } from '@/types/knowledge-graph';

export function useKnowledgeGraph() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [insights, setInsights] = useState<GraphInsight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recherche contextuelle
  const search = useCallback(async (query: ContextualSearchQuery) => {
    if (!query.query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-graph/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Knowledge graph search error:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Recherche simple (GET)
  const quickSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/knowledge-graph/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Quick search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Knowledge graph quick search error:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Charger les insights
  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-graph/insights');

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
      return data.insights || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Knowledge graph insights error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apprendre à partir d'un ticket
  const learnFromTicket = useCallback(async (learningData: LearningData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-graph/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(learningData),
      });

      if (!response.ok) {
        throw new Error('Learning failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Knowledge graph learning error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtenir la visualisation du graphe
  const getVisualization = useCallback(async (layout: 'force' | 'hierarchical' | 'circular' | 'grid' = 'force') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/knowledge-graph/visualization?layout=${layout}`);

      if (!response.ok) {
        throw new Error('Failed to get visualization');
      }

      const data = await response.json();
      return data.visualization;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Knowledge graph visualization error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effacer les résultats
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  // Effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // État
    searchResults,
    insights,
    isSearching,
    isLoading,
    error,

    // Actions
    search,
    quickSearch,
    loadInsights,
    learnFromTicket,
    getVisualization,
    clearResults,
    clearError,
  };
}

// Hook pour la recherche contextuelle avancée
export function useContextualSearch() {
  const [query, setQuery] = useState<ContextualSearchQuery>({
    query: '',
    context: {},
    semantic: true,
    filters: {
      maxResults: 20,
      minConfidence: 0.1
    }
  });

  const { search, searchResults, isSearching, error } = useKnowledgeGraph();

  const updateQuery = useCallback((updates: Partial<ContextualSearchQuery>) => {
    setQuery(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContext = useCallback((context: Partial<ContextualSearchQuery['context']>) => {
    setQuery(prev => ({ 
      ...prev, 
      context: { ...prev.context, ...context } 
    }));
  }, []);

  const updateFilters = useCallback((filters: Partial<ContextualSearchQuery['filters']>) => {
    setQuery(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, ...filters } 
    }));
  }, []);

  const executeSearch = useCallback(async () => {
    return await search(query);
  }, [search, query]);

  return {
    query,
    searchResults,
    isSearching,
    error,
    updateQuery,
    updateContext,
    updateFilters,
    executeSearch,
  };
}

// Hook pour les insights
export function useInsights() {
  const { insights, loadInsights, isLoading, error } = useKnowledgeGraph();
  const [selectedInsight, setSelectedInsight] = useState<GraphInsight | null>(null);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const selectInsight = useCallback((insight: GraphInsight) => {
    setSelectedInsight(insight);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedInsight(null);
  }, []);

  return {
    insights,
    selectedInsight,
    isLoading,
    error,
    selectInsight,
    clearSelection,
    refreshInsights: loadInsights,
  };
}