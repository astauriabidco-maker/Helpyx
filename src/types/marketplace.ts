export interface Expert {
  id: string;
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio: string;
    location: string;
    languages: string[];
  };
  expertise: {
    category: ExpertCategory;
    specializations: string[];
    certifications: Certification[];
    yearsExperience: number;
  };
  stats: {
    totalGigs: number;
    successRate: number;
    averageRating: number;
    totalEarnings: number;
    responseTime: number; // minutes
  };
  availability: {
    timezone: string;
    schedule: AvailabilitySlot[];
    isAvailable: boolean;
  };
  pricing: {
    hourlyRate: number;
    minimumGigPrice: number;
    maximumGigPrice: number;
  };
  verification: {
    isVerified: boolean;
    verificationDate?: Date;
    identityVerified: boolean;
    skillsVerified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  complexity: GigComplexity;
  estimatedDuration: number; // minutes
  price: number;
  expertId: string;
  expert: Expert;
  requirements: {
    skills: string[];
    experience: string;
    tools?: string[];
  };
  deliverables: string[];
  tags: string[];
  status: GigStatus;
  ticketId?: string; // Si lié à un ticket existant
  clientId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface GigApplication {
  id: string;
  gigId: string;
  expertId: string;
  expert: Expert;
  proposal: string;
  estimatedTime: number;
  proposedPrice?: number;
  questions?: string[];
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  gigId: string;
  expertId: string;
  clientId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingModel {
  basePrice: number;
  complexityMultiplier: number;
  urgencyMultiplier: number;
  platformFee: number; // percentage
  refundPolicy: {
    eligible: boolean;
    conditions: string[];
    timeLimit: number; // hours
  };
  pricingTiers: {
    simple: { min: number; max: number };
    intermediate: { min: number; max: number };
    complex: { min: number; max: number };
  };
}

export interface MarketplaceTransaction {
  id: string;
  gigId: string;
  expertId: string;
  clientId: string;
  amount: number;
  platformFee: number;
  expertEarnings: number;
  status: TransactionStatus;
  paymentMethod: string;
  refundRequested?: boolean;
  refundReason?: string;
  refundAmount?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isAvailable: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface MarketplaceFilters {
  category?: ExpertCategory;
  priceRange?: { min: number; max: number };
  rating?: number;
  availability?: boolean;
  location?: string;
  languages?: string[];
  experience?: { min: number; max: number };
  verified?: boolean;
}

export interface MarketplaceStats {
  totalExperts: number;
  activeGigs: number;
  completedGigs: number;
  totalRevenue: number;
  averageGigPrice: number;
  averageRating: number;
  popularCategories: { category: ExpertCategory; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

// Enums
export enum ExpertCategory {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  NETWORK = 'network',
  SECURITY = 'security',
  CLOUD = 'cloud',
  MOBILE = 'mobile',
  DATABASE = 'database',
  DEVOPS = 'devops',
  AI_ML = 'ai_ml',
  OTHER = 'other'
}

export enum GigCategory {
  TROUBLESHOOTING = 'troubleshooting',
  INSTALLATION = 'installation',
  CONFIGURATION = 'configuration',
  OPTIMIZATION = 'optimization',
  REPAIR = 'repair',
  CONSULTATION = 'consultation',
  TRAINING = 'training',
  AUDIT = 'audit'
}

export enum GigComplexity {
  SIMPLE = 'simple',      // 5-15€
  INTERMEDIATE = 'intermediate', // 15-30€
  COMPLEX = 'complex'     // 30-50€
}

export enum GigStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

// Search and Discovery
export interface GigSearchResult {
  gigs: Gig[];
  total: number;
  filters: MarketplaceFilters;
  sortBy: string;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ExpertRecommendation {
  expert: Expert;
  matchScore: number;
  matchReasons: string[];
  estimatedAvailability: Date;
}

// Notifications
export interface MarketplaceNotification {
  id: string;
  userId: string;
  type: 'new_gig' | 'application_received' | 'gig_completed' | 'review_received';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}