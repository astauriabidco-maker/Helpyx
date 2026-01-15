import { useState, useEffect } from 'react';
import { 
  Expert, 
  Gig, 
  Review, 
  MarketplaceStats,
  MarketplaceFilters,
  GigSearchResult,
  ExpertRecommendation,
  ExpertCategory,
  GigCategory,
  GigComplexity
} from '@/types/marketplace';

interface UseMarketplaceReturn {
  experts: Expert[];
  gigs: Gig[];
  stats: MarketplaceStats | null;
  loading: boolean;
  error: string | null;
  searchExperts: (filters: MarketplaceFilters) => Promise<void>;
  searchGigs: (filters: MarketplaceFilters, page?: number) => Promise<GigSearchResult>;
  getExpert: (id: string) => Promise<Expert | null>;
  getGig: (id: string) => Promise<Gig | null>;
  getExpertReviews: (expertId: string) => Promise<Review[]>;
  recommendExperts: (gigId: string) => Promise<ExpertRecommendation[]>;
  createReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'verified'>) => Promise<Review>;
  refreshStats: () => Promise<void>;
}

export function useMarketplace(): UseMarketplaceReturn {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchExperts = async (filters: MarketplaceFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters.experience) {
        params.append('minExperience', filters.experience.min.toString());
        params.append('maxExperience', filters.experience.max.toString());
      }
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }

      const response = await fetch(`/api/marketplace/experts?${params}`);
      const data = await response.json();

      if (data.success) {
        setExperts(data.data);
      } else {
        setError(data.error || 'Failed to search experts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const searchGigs = async (filters: MarketplaceFilters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (filters.category) params.append('category', filters.category);
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }

      const response = await fetch(`/api/marketplace/gigs?${params}`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setGigs(data.data.gigs);
        } else {
          setGigs(prev => [...prev, ...data.data.gigs]);
        }
        return data.data;
      } else {
        setError(data.error || 'Failed to search gigs');
        return { gigs: [], total: 0, filters, sortBy: 'relevance', pagination: { page, limit: 20, hasMore: false } };
      }
    } catch (err) {
      setError('Network error');
      return { gigs: [], total: 0, filters, sortBy: 'relevance', pagination: { page, limit: 20, hasMore: false } };
    } finally {
      setLoading(false);
    }
  };

  const getExpert = async (id: string): Promise<Expert | null> => {
    try {
      const response = await fetch(`/api/marketplace/experts/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  };

  const getGig = async (id: string): Promise<Gig | null> => {
    try {
      const response = await fetch(`/api/marketplace/gigs/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  };

  const getExpertReviews = async (expertId: string): Promise<Review[]> => {
    try {
      const response = await fetch(`/api/marketplace/reviews?expertId=${expertId}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  };

  const recommendExperts = async (gigId: string): Promise<ExpertRecommendation[]> => {
    try {
      const response = await fetch(`/api/marketplace/gigs/${gigId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recommend' })
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  };

  const createReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'verified'>): Promise<Review> => {
    const response = await fetch('/api/marketplace/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create review');
    }

    return data.data;
  };

  const refreshStats = async () => {
    try {
      const response = await fetch('/api/marketplace/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    refreshStats();
    searchExperts({});
    searchGigs({}, 1);
  }, []);

  return {
    experts,
    gigs,
    stats,
    loading,
    error,
    searchExperts,
    searchGigs,
    getExpert,
    getGig,
    getExpertReviews,
    recommendExperts,
    createReview,
    refreshStats
  };
}

// Hook for managing expert applications
export function useExpertApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyToGig = async (gigId: string, expertId: string, application: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/gigs/${gigId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          expertId,
          ...application
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to apply to gig');
      }

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    applyToGig,
    loading,
    error
  };
}

// Hook for marketplace filters
export function useMarketplaceFilters() {
  const [filters, setFilters] = useState<MarketplaceFilters>({});

  const updateFilter = (key: keyof MarketplaceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}