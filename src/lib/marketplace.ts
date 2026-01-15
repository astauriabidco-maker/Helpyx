import { 
  Expert, 
  Gig, 
  Review, 
  PricingModel, 
  MarketplaceTransaction,
  MarketplaceFilters,
  GigSearchResult,
  ExpertRecommendation,
  ExpertCategory,
  GigCategory,
  GigComplexity,
  GigStatus,
  ApplicationStatus,
  TransactionStatus,
  MarketplaceStats,
  GigApplication,
  MarketplaceNotification
} from '@/types/marketplace';

export class MarketplaceEngine {
  private static instance: MarketplaceEngine;
  private experts: Map<string, Expert> = new Map();
  private gigs: Map<string, Gig> = new Map();
  private reviews: Map<string, Review[]> = new Map();
  private transactions: Map<string, MarketplaceTransaction> = new Map();
  private applications: Map<string, GigApplication[]> = new Map();

  private pricingModel: PricingModel = {
    basePrice: 10,
    complexityMultiplier: 1.5,
    urgencyMultiplier: 1.2,
    platformFee: 0.15, // 15%
    refundPolicy: {
      eligible: true,
      conditions: [
        'Problem not resolved',
        'Expert did not show up',
        'Technical issues preventing completion'
      ],
      timeLimit: 24 // hours
    },
    pricingTiers: {
      simple: { min: 5, max: 15 },
      intermediate: { min: 15, max: 30 },
      complex: { min: 30, max: 50 }
    }
  };

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MarketplaceEngine {
    if (!MarketplaceEngine.instance) {
      MarketplaceEngine.instance = new MarketplaceEngine();
    }
    return MarketplaceEngine.instance;
  }

  // Expert Management
  async registerExpert(expertData: Omit<Expert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expert> {
    const expert: Expert = {
      ...expertData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.experts.set(expert.id, expert);
    return expert;
  }

  async getExpert(expertId: string): Promise<Expert | null> {
    return this.experts.get(expertId) || null;
  }

  async updateExpert(expertId: string, updates: Partial<Expert>): Promise<Expert | null> {
    const expert = this.experts.get(expertId);
    if (!expert) return null;

    const updatedExpert = {
      ...expert,
      ...updates,
      updatedAt: new Date()
    };

    this.experts.set(expertId, updatedExpert);
    return updatedExpert;
  }

  async searchExperts(filters: MarketplaceFilters): Promise<Expert[]> {
    let experts = Array.from(this.experts.values());

    // Apply filters
    if (filters.category) {
      experts = experts.filter(e => e.expertise.category === filters.category);
    }

    if (filters.rating) {
      experts = experts.filter(e => e.stats.averageRating >= filters.rating!);
    }

    if (filters.verified) {
      experts = experts.filter(e => e.verification.isVerified);
    }

    if (filters.experience) {
      experts = experts.filter(e => 
        e.expertise.yearsExperience >= filters.experience!.min &&
        e.expertise.yearsExperience <= filters.experience!.max
      );
    }

    if (filters.priceRange) {
      experts = experts.filter(e => 
        e.pricing.minimumGigPrice >= filters.priceRange!.min &&
        e.pricing.maximumGigPrice <= filters.priceRange!.max
      );
    }

    // Sort by rating and success rate
    return experts.sort((a, b) => {
      const scoreA = a.stats.averageRating * a.stats.successRate;
      const scoreB = b.stats.averageRating * b.stats.successRate;
      return scoreB - scoreA;
    });
  }

  // Gig Management
  async createGig(gigData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Gig> {
    const gig: Gig = {
      ...gigData,
      id: this.generateId(),
      status: GigStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate price based on complexity
    gig.price = this.calculateGigPrice(gig.complexity, gig.estimatedDuration);

    this.gigs.set(gig.id, gig);
    return gig;
  }

  async getGig(gigId: string): Promise<Gig | null> {
    return this.gigs.get(gigId) || null;
  }

  async searchGigs(filters: MarketplaceFilters, page = 1, limit = 20): Promise<GigSearchResult> {
    let gigs = Array.from(this.gigs.values())
      .filter(gig => gig.status === GigStatus.OPEN);

    // Apply filters
    if (filters.category) {
      gigs = gigs.filter(g => g.category === this.mapExpertToGigCategory(filters.category!));
    }

    if (filters.priceRange) {
      gigs = gigs.filter(g => 
        g.price >= filters.priceRange!.min &&
        g.price <= filters.priceRange!.max
      );
    }

    const total = gigs.length;
    const startIndex = (page - 1) * limit;
    const paginatedGigs = gigs.slice(startIndex, startIndex + limit);

    return {
      gigs: paginatedGigs,
      total,
      filters,
      sortBy: 'relevance',
      pagination: {
        page,
        limit,
        hasMore: startIndex + limit < total
      }
    };
  }

  async applyToGig(gigId: string, expertId: string, application: Omit<GigApplication, 'id' | 'gigId' | 'expertId' | 'createdAt' | 'updatedAt'>): Promise<GigApplication> {
    const gigApplication: GigApplication = {
      ...application,
      id: this.generateId(),
      gigId,
      expertId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const applications = this.applications.get(gigId) || [];
    applications.push(gigApplication);
    this.applications.set(gigId, applications);

    return gigApplication;
  }

  async getGigApplications(gigId: string): Promise<GigApplication[]> {
    return this.applications.get(gigId) || [];
  }

  async acceptApplication(applicationId: string, gigId: string): Promise<boolean> {
    const applications = this.applications.get(gigId) || [];
    const application = applications.find(a => a.id === applicationId);
    
    if (!application) return false;

    // Update application status
    application.status = ApplicationStatus.ACCEPTED;
    application.updatedAt = new Date();

    // Update gig status
    const gig = this.gigs.get(gigId);
    if (gig) {
      gig.status = GigStatus.IN_PROGRESS;
      gig.updatedAt = new Date();
    }

    // Reject other applications
    applications.forEach(a => {
      if (a.id !== applicationId) {
        a.status = ApplicationStatus.REJECTED;
        a.updatedAt = new Date();
      }
    });

    return true;
  }

  // Review System
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'verified'>): Promise<Review> {
    const review: Review = {
      ...reviewData,
      id: this.generateId(),
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reviews = this.reviews.get(reviewData.expertId) || [];
    reviews.push(review);
    this.reviews.set(reviewData.expertId, reviews);

    // Update expert stats
    await this.updateExpertStats(reviewData.expertId);

    return review;
  }

  async getExpertReviews(expertId: string): Promise<Review[]> {
    return this.reviews.get(expertId) || [];
  }

  // Transaction Management
  async createTransaction(transactionData: Omit<MarketplaceTransaction, 'id' | 'createdAt' | 'status'>): Promise<MarketplaceTransaction> {
    const transaction: MarketplaceTransaction = {
      ...transactionData,
      id: this.generateId(),
      status: TransactionStatus.PENDING,
      createdAt: new Date()
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async completeTransaction(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    // Update expert earnings
    const expert = this.experts.get(transaction.expertId);
    if (expert) {
      expert.stats.totalEarnings += transaction.expertEarnings;
      expert.stats.totalGigs += 1;
      expert.updatedAt = new Date();
    }

    return true;
  }

  async requestRefund(transactionId: string, reason: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    const hoursSinceCompletion = transaction.completedAt 
      ? (Date.now() - transaction.completedAt.getTime()) / (1000 * 60 * 60)
      : 0;

    if (hoursSinceCompletion > this.pricingModel.refundPolicy.timeLimit) {
      return false;
    }

    transaction.refundRequested = true;
    transaction.refundReason = reason;
    transaction.refundAmount = transaction.amount;

    return true;
  }

  // Recommendation Engine
  async recommendExperts(gigId: string): Promise<ExpertRecommendation[]> {
    const gig = this.gigs.get(gigId);
    if (!gig) return [];

    const experts = Array.from(this.experts.values())
      .filter(e => e.verification.isVerified && e.availability.isAvailable);

    const recommendations: ExpertRecommendation[] = experts.map(expert => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // Category match
      if (expert.expertise.category === this.mapGigToExpertCategory(gig.category)) {
        matchScore += 30;
        matchReasons.push('Expertise correspondante');
      }

      // Specialization match
      const matchingSkills = expert.expertise.specializations.filter(s => 
        gig.requirements.skills.includes(s)
      );
      if (matchingSkills.length > 0) {
        matchScore += matchingSkills.length * 10;
        matchReasons.push(`${matchingSkills.length} compétences correspondantes`);
      }

      // Rating bonus
      matchScore += expert.stats.averageRating * 5;

      // Experience bonus
      matchScore += Math.min(expert.expertise.yearsExperience * 2, 20);

      // Response time bonus
      if (expert.stats.responseTime < 30) {
        matchScore += 10;
        matchReasons.push('Réponse rapide');
      }

      return {
        expert,
        matchScore: Math.min(matchScore, 100),
        matchReasons,
        estimatedAvailability: new Date(Date.now() + expert.stats.responseTime * 60000)
      };
    });

    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  // Analytics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const experts = Array.from(this.experts.values());
    const gigs = Array.from(this.gigs.values());
    const transactions = Array.from(this.transactions.values());

    const completedGigs = gigs.filter(g => g.status === GigStatus.COMPLETED);
    const totalRevenue = transactions
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryCount = experts.reduce((acc, expert) => {
      acc[expert.expertise.category] = (acc[expert.expertise.category] || 0) + 1;
      return acc;
    }, {} as Record<ExpertCategory, number>);

    return {
      totalExperts: experts.length,
      activeGigs: gigs.filter(g => g.status === GigStatus.OPEN).length,
      completedGigs: completedGigs.length,
      totalRevenue,
      averageGigPrice: completedGigs.length > 0 
        ? completedGigs.reduce((sum, g) => sum + g.price, 0) / completedGigs.length 
        : 0,
      averageRating: experts.length > 0 
        ? experts.reduce((sum, e) => sum + e.stats.averageRating, 0) / experts.length 
        : 0,
      popularCategories: Object.entries(categoryCount)
        .map(([category, count]) => ({ category: category as ExpertCategory, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      revenueByMonth: this.calculateMonthlyRevenue(transactions)
    };
  }

  // Helper Methods
  private calculateGigPrice(complexity: GigComplexity, duration: number): number {
    const basePrice = this.pricingModel.basePrice;
    const complexityMultiplier = complexity === GigComplexity.SIMPLE ? 1 : 
                               complexity === GigComplexity.INTERMEDIATE ? 1.5 : 2;
    
    let price = basePrice * complexityMultiplier;
    
    // Add duration factor (15-30 minutes target)
    if (duration > 30) {
      price *= 1.2;
    }

    // Ensure price is within tier limits
    const tier = this.pricingModel.pricingTiers[complexity];
    return Math.max(tier.min, Math.min(tier.max, Math.round(price)));
  }

  private async updateExpertStats(expertId: string): Promise<void> {
    const expert = this.experts.get(expertId);
    const reviews = this.reviews.get(expertId) || [];
    
    if (!expert) return;

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const successfulGigs = reviews.filter(r => r.rating >= 4).length;
    const successRate = reviews.length > 0 ? successfulGigs / reviews.length : 0;

    expert.stats.averageRating = averageRating;
    expert.stats.successRate = successRate;
    expert.updatedAt = new Date();
  }

  private mapExpertToGigCategory(category: ExpertCategory): GigCategory {
    const mapping = {
      [ExpertCategory.SOFTWARE]: GigCategory.TROUBLESHOOTING,
      [ExpertCategory.HARDWARE]: GigCategory.REPAIR,
      [ExpertCategory.NETWORK]: GigCategory.CONFIGURATION,
      [ExpertCategory.SECURITY]: GigCategory.AUDIT,
      [ExpertCategory.CLOUD]: GigCategory.CONSULTATION,
      [ExpertCategory.MOBILE]: GigCategory.TROUBLESHOOTING,
      [ExpertCategory.DATABASE]: GigCategory.OPTIMIZATION,
      [ExpertCategory.DEVOPS]: GigCategory.CONFIGURATION,
      [ExpertCategory.AI_ML]: GigCategory.CONSULTATION,
      [ExpertCategory.OTHER]: GigCategory.TROUBLESHOOTING
    };
    return mapping[category] || GigCategory.TROUBLESHOOTING;
  }

  private mapGigToExpertCategory(category: GigCategory): ExpertCategory {
    const mapping = {
      [GigCategory.TROUBLESHOOTING]: ExpertCategory.SOFTWARE,
      [GigCategory.REPAIR]: ExpertCategory.HARDWARE,
      [GigCategory.CONFIGURATION]: ExpertCategory.NETWORK,
      [GigCategory.AUDIT]: ExpertCategory.SECURITY,
      [GigCategory.CONSULTATION]: ExpertCategory.CLOUD,
      [GigCategory.OPTIMIZATION]: ExpertCategory.DATABASE,
      [GigCategory.INSTALLATION]: ExpertCategory.SOFTWARE,
      [GigCategory.TRAINING]: ExpertCategory.OTHER
    };
    return mapping[category] || ExpertCategory.SOFTWARE;
  }

  private calculateMonthlyRevenue(transactions: MarketplaceTransaction[]): { month: string; revenue: number }[] {
    const monthlyData = transactions
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((acc, t) => {
        const month = new Date(t.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeMockData(): void {
    // Initialize with sample experts
    const sampleExperts = this.createSampleExperts();
    sampleExperts.forEach(expert => {
      this.experts.set(expert.id, expert);
    });

    // Initialize with sample gigs
    const sampleGigs = this.createSampleGigs();
    sampleGigs.forEach(gig => {
      this.gigs.set(gig.id, gig);
    });
  }

  private createSampleExperts(): Expert[] {
    return [
      {
        id: 'expert_1',
        userId: 'user_1',
        profile: {
          firstName: 'Jean',
          lastName: 'Dupont',
          bio: 'Développeur senior avec 10 ans d\'expérience en React et Node.js',
          location: 'Paris, France',
          languages: ['Français', 'Anglais']
        },
        expertise: {
          category: ExpertCategory.SOFTWARE,
          specializations: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
          certifications: [
            {
              id: 'cert_1',
              name: 'AWS Certified Developer',
              issuer: 'Amazon Web Services',
              issueDate: new Date('2023-01-15')
            }
          ],
          yearsExperience: 10
        },
        stats: {
          totalGigs: 47,
          successRate: 0.96,
          averageRating: 4.8,
          totalEarnings: 2350,
          responseTime: 15
        },
        availability: {
          timezone: 'Europe/Paris',
          schedule: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true }
          ],
          isAvailable: true
        },
        pricing: {
          hourlyRate: 50,
          minimumGigPrice: 15,
          maximumGigPrice: 40
        },
        verification: {
          isVerified: true,
          verificationDate: new Date('2023-01-01'),
          identityVerified: true,
          skillsVerified: true
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'expert_2',
        userId: 'user_2',
        profile: {
          firstName: 'Marie',
          lastName: 'Martin',
          bio: 'Technicienne hardware spécialisée en PC et imprimantes',
          location: 'Lyon, France',
          languages: ['Français']
        },
        expertise: {
          category: ExpertCategory.HARDWARE,
          specializations: ['PC Repair', 'Printers', 'Network Hardware', 'Diagnostics'],
          certifications: [
            {
              id: 'cert_2',
              name: 'CompTIA A+',
              issuer: 'CompTIA',
              issueDate: new Date('2022-06-20')
            }
          ],
          yearsExperience: 7
        },
        stats: {
          totalGigs: 32,
          successRate: 0.94,
          averageRating: 4.6,
          totalEarnings: 1280,
          responseTime: 20
        },
        availability: {
          timezone: 'Europe/Paris',
          schedule: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isAvailable: true },
            { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isAvailable: true },
            { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isAvailable: true },
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: true }
          ],
          isAvailable: true
        },
        pricing: {
          hourlyRate: 35,
          minimumGigPrice: 10,
          maximumGigPrice: 30
        },
        verification: {
          isVerified: true,
          verificationDate: new Date('2022-06-01'),
          identityVerified: true,
          skillsVerified: true
        },
        createdAt: new Date('2022-06-01'),
        updatedAt: new Date()
      }
    ];
  }

  private createSampleGigs(): Gig[] {
    const experts = Array.from(this.experts.values());
    
    return [
      {
        id: 'gig_1',
        title: 'Résoudre erreur BSOD Windows 11',
        description: 'Aide pour diagnostiquer et résoudre un écran bleu récurrent sur Windows 11',
        category: GigCategory.TROUBLESHOOTING,
        complexity: GigComplexity.INTERMEDIATE,
        estimatedDuration: 25,
        price: 25,
        expertId: experts[0]?.id || '',
        expert: experts[0]!,
        requirements: {
          skills: ['Windows', 'Diagnostics', 'Troubleshooting'],
          experience: '3+ years Windows support',
          tools: ['Remote Desktop', 'Diagnostics tools']
        },
        deliverables: [
          'Diagnostic complet du problème',
          'Solution appliquée et testée',
          'Recommandations de prévention'
        ],
        tags: ['windows', 'bsod', 'troubleshooting', 'urgent'],
        status: GigStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      {
        id: 'gig_2',
        title: 'Configuration driver imprimante HP',
        description: 'Installer et configurer correctement le driver pour imprimante HP LaserJet',
        category: GigCategory.INSTALLATION,
        complexity: GigComplexity.SIMPLE,
        estimatedDuration: 15,
        price: 12,
        expertId: experts[1]?.id || '',
        expert: experts[1]!,
        requirements: {
          skills: ['Printers', 'Drivers', 'Installation'],
          experience: 'Basic printer setup knowledge'
        },
        deliverables: [
          'Driver installé et fonctionnel',
          'Test d\'impression réussi',
          'Configuration réseau si nécessaire'
        ],
        tags: ['hp', 'printer', 'driver', 'installation'],
        status: GigStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      }
    ];
  }
}