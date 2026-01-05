// Worker Growth System - Dummy Data & Interfaces

export interface GrowthMetrics {
  profileViews: number;
  searchAppearances: number;
  jobRequests: number;
  jobsCompleted: number;
}

export interface VisibilityScore {
  score: number; // 0-100
  factors: {
    profileCompleteness: number;
    availabilityStatus: number;
    recentActivity: number;
    ratings: number;
  };
}

export interface PerformanceMetrics {
  responseRate: number; // percentage
  completionRate: number; // percentage
  acceptanceRate: number; // percentage
  averageResponseTime: string; // e.g., "3 mins"
  averageRating: number; // 1-5
}

export interface OptimizationTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number; // Optional progress tracking (0-100)
  unlockedAt?: string; // Date when unlocked
}

// Dummy Growth Metrics
export const DUMMY_GROWTH_METRICS: GrowthMetrics = {
  profileViews: 742,
  searchAppearances: 1684,
  jobRequests: 18,
  jobsCompleted: 12,
};

// Dummy Visibility Score
export const DUMMY_VISIBILITY_SCORE: VisibilityScore = {
  score: 78,
  factors: {
    profileCompleteness: 85,
    availabilityStatus: 90,
    recentActivity: 65,
    ratings: 88,
  },
};

// Dummy Performance Metrics
export const DUMMY_PERFORMANCE_METRICS: PerformanceMetrics = {
  responseRate: 92,
  completionRate: 94,
  acceptanceRate: 87,
  averageResponseTime: '3 mins',
  averageRating: 4.7,
};

// Dummy Optimization Tips
export const DUMMY_OPTIMIZATION_TIPS: OptimizationTip[] = [
  {
    id: 'tip-1',
    icon: 'construct',
    title: 'Add 1 more skill',
    description: 'Appear in more searches by adding additional skills',
    action: 'Add Skill',
    route: '/profile',
    priority: 'high',
  },
  {
    id: 'tip-2',
    icon: 'image',
    title: 'Add profile photo',
    description: 'Workers with photos get 3× more jobs',
    action: 'Upload Photo',
    route: '/profile',
    priority: 'high',
  },
  {
    id: 'tip-3',
    icon: 'time',
    title: 'Respond faster',
    description: 'Respond within 5 minutes to rank higher',
    action: 'Learn More',
    route: '/profile',
    priority: 'medium',
  },
  {
    id: 'tip-4',
    icon: 'location',
    title: 'Expand service area',
    description: 'Increase travel radius to reach more customers',
    action: 'Update',
    route: '/profile',
    priority: 'medium',
  },
  {
    id: 'tip-5',
    icon: 'calendar',
    title: 'Update availability',
    description: 'Mark yourself as available to get instant requests',
    action: 'Set Available',
    route: '/profile',
    priority: 'low',
  },
];

// Dummy Achievements
export const DUMMY_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-1',
    icon: '🏆',
    title: 'Top Rated',
    description: 'Maintain 4.5+ rating for 3 months',
    unlocked: true,
    unlockedAt: '2024-11-15',
  },
  {
    id: 'achievement-2',
    icon: '⚡',
    title: 'Fast Responder',
    description: 'Respond to 90% of requests within 5 minutes',
    unlocked: true,
    unlockedAt: '2024-12-01',
  },
  {
    id: 'achievement-3',
    icon: '💼',
    title: '50 Jobs Completed',
    description: 'Complete 50 jobs successfully',
    unlocked: false,
    progress: 78, // 39/50
  },
  {
    id: 'achievement-4',
    icon: '🌟',
    title: 'Customer Favorite',
    description: 'Receive 10+ five-star reviews',
    unlocked: true,
    unlockedAt: '2024-10-20',
  },
  {
    id: 'achievement-5',
    icon: '🎯',
    title: 'Perfect Month',
    description: 'Complete all jobs with 5-star ratings in one month',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'achievement-6',
    icon: '🚀',
    title: 'Early Adopter',
    description: 'Join ConnectO in the first 1000 workers',
    unlocked: true,
    unlockedAt: '2024-09-10',
  },
];

// Helper function to calculate visibility score based on factors
export function calculateVisibilityScore(factors: VisibilityScore['factors']): number {
  const weights = {
    profileCompleteness: 0.3,
    availabilityStatus: 0.25,
    recentActivity: 0.25,
    ratings: 0.2,
  };

  return Math.round(
    factors.profileCompleteness * weights.profileCompleteness +
    factors.availabilityStatus * weights.availabilityStatus +
    factors.recentActivity * weights.recentActivity +
    factors.ratings * weights.ratings
  );
}

// Get priority tips based on worker's current state
export function getPriorityTips(limit: number = 3): OptimizationTip[] {
  return DUMMY_OPTIMIZATION_TIPS
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, limit);
}

// Get unlocked achievements count
export function getUnlockedAchievementsCount(): number {
  return DUMMY_ACHIEVEMENTS.filter(a => a.unlocked).length;
}

// Get total achievements count
export function getTotalAchievementsCount(): number {
  return DUMMY_ACHIEVEMENTS.length;
}
