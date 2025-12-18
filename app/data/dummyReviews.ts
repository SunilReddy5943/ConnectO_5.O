import { Review } from '../components/ReviewCard';

const reviewComments = [
  'Very professional and on time. Highly recommended!',
  'Excellent work quality. Will hire again for sure.',
  'Quick and efficient service. Very satisfied.',
  'Great attention to detail. Job well done!',
  'Polite and skilled worker. Fair pricing too.',
  'Completed the work faster than expected.',
  'Very knowledgeable and experienced.',
  'Clean work and no mess left behind.',
  'Honest and trustworthy. Great communication.',
  'Best service I have received so far!',
  'Good workmanship and reasonable rates.',
  'Punctual and professional throughout.',
  'Solved the problem quickly and efficiently.',
  'Would definitely recommend to others.',
  'Skilled and courteous. Happy with the result.',
  'Fair pricing and excellent quality work.',
  'Very cooperative and understanding.',
  'Did a fantastic job! Exceeded expectations.',
  'Reliable and hardworking professional.',
  'Great experience from start to finish.',
];

const customerNames = [
  'Amit Kumar', 'Priya Sharma', 'Rahul Singh', 'Neha Patel', 'Vikram Reddy',
  'Anjali Verma', 'Suresh Nair', 'Kavita Joshi', 'Rajesh Gupta', 'Pooja Iyer',
  'Manoj Das', 'Sneha Rao', 'Arun Menon', 'Divya Pillai', 'Karthik Naidu',
  'Ritu Banerjee', 'Sanjay Ghosh', 'Meera Sen', 'Deepak Mukherjee', 'Swati Bose',
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export function generateReviewsForWorker(
  workerId: string,
  workerCategory: string,
  reviewCount: number
): Review[] {
  const reviews: Review[] = [];
  
  for (let i = 0; i < reviewCount; i++) {
    reviews.push({
      id: `review-${workerId}-${i + 1}`,
      customer_name: getRandomElement(customerNames),
      rating: getRandomNumber(4, 5), // Mostly 4-5 stars
      comment: getRandomElement(reviewComments),
      date: getRandomDate(getRandomNumber(1, 365)),
      job_type: workerCategory,
    });
  }
  
  // Sort by date (newest first)
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Calculate trust score based on dummy logic
export function calculateTrustScore(worker: {
  profile_photo_url?: string;
  sub_skills?: string[];
  city?: string;
  daily_wage_min?: number;
  availability_type?: string;
  rating_average?: number;
  rating_count?: number;
  years_of_experience?: number;
}): number {
  let score = 0;
  
  // Profile completeness (30%)
  let completenessScore = 0;
  if (worker.profile_photo_url) completenessScore += 6;
  if (worker.sub_skills && worker.sub_skills.length > 0) completenessScore += 6;
  if (worker.city) completenessScore += 6;
  if (worker.daily_wage_min) completenessScore += 6;
  if (worker.availability_type) completenessScore += 6;
  score += completenessScore;
  
  // Ratings (40%)
  if (worker.rating_average && worker.rating_count) {
    const ratingScore = (worker.rating_average / 5) * 40;
    score += ratingScore;
  }
  
  // Job completion rate (30%) - Dummy calculation based on rating count
  if (worker.rating_count) {
    const completionScore = Math.min((worker.rating_count / 100) * 30, 30);
    score += completionScore;
  }
  
  return Math.round(Math.min(score, 100));
}

// Calculate profile completeness percentage
export function calculateProfileCompleteness(worker: {
  profile_photo_url?: string;
  sub_skills?: string[];
  city?: string;
  locality?: string;
  daily_wage_min?: number;
  availability_type?: string;
  bio?: string;
  languages?: string[];
}): number {
  let completed = 0;
  const total = 8;
  
  if (worker.profile_photo_url) completed++;
  if (worker.sub_skills && worker.sub_skills.length > 0) completed++;
  if (worker.city) completed++;
  if (worker.locality) completed++;
  if (worker.daily_wage_min) completed++;
  if (worker.availability_type) completed++;
  if (worker.bio) completed++;
  if (worker.languages && worker.languages.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
}

// Check if worker is verified (dummy logic)
export function isWorkerVerified(worker: {
  kyc_status?: string;
  profile_photo_url?: string;
  rating_count?: number;
}): boolean {
  return (
    worker.kyc_status === 'VERIFIED' &&
    !!worker.profile_photo_url &&
    (worker.rating_count || 0) >= 1
  );
}

// Get trust insights for worker dashboard
export function getWorkerTrustInsights(worker: {
  kyc_status?: string;
  rating_average?: number;
  rating_count?: number;
}): {
  verified: boolean;
  completionRate: number;
  averageRating: number;
} {
  return {
    verified: worker.kyc_status === 'VERIFIED',
    completionRate: Math.min(((worker.rating_count || 0) / (worker.rating_count || 1)) * 100, 100),
    averageRating: worker.rating_average || 0,
  };
}
