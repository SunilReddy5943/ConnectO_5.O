import { WORKER_IMAGES, CATEGORIES, INDIAN_CITIES, LANGUAGES } from '../constants/theme';

// Generate dummy workers for demo
const firstNames = [
  'Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Ganesh', 'Dinesh', 'Mukesh', 'Rakesh',
  'Anil', 'Sunil', 'Vijay', 'Sanjay', 'Ajay', 'Ravi', 'Kiran', 'Mohan', 'Sohan',
  'Gopal', 'Krishna', 'Shyam', 'Ram', 'Lakshman', 'Bharat', 'Arjun', 'Karan',
  'Amit', 'Sumit', 'Rohit', 'Mohit', 'Nitin', 'Sachin', 'Rahul', 'Deepak',
  'Prakash', 'Vikash', 'Santosh', 'Ashok', 'Vinod', 'Manoj', 'Pramod',
];

const lastNames = [
  'Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Patel', 'Shah', 'Joshi',
  'Yadav', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Chauhan', 'Rajput',
  'Thakur', 'Nair', 'Menon', 'Reddy', 'Rao', 'Naidu', 'Pillai', 'Iyer',
  'Das', 'Bose', 'Sen', 'Ghosh', 'Banerjee', 'Mukherjee', 'Chatterjee',
];

const subSkillsByCategory: { [key: string]: string[] } = {
  'Plumber': ['Bathroom Plumbing', 'Kitchen Plumbing', 'Pipe Fitting', 'Water Heater', 'Leak Repair', 'Drain Cleaning', 'Sewer Line', 'Water Tank'],
  'Electrician': ['Wiring', 'Switchboard', 'Fan Installation', 'Light Fitting', 'MCB/ELCB', 'Generator', 'Inverter', 'Industrial Wiring'],
  'Carpenter': ['Furniture Making', 'Door Fitting', 'Window Fitting', 'Modular Kitchen', 'Wardrobe', 'False Ceiling', 'Wood Polish', 'Repair Work'],
  'Painter': ['Interior Painting', 'Exterior Painting', 'Texture Painting', 'POP Work', 'Waterproofing', 'Wood Painting', 'Metal Painting', 'Spray Painting'],
  'Mason': ['Brickwork', 'Plastering', 'Tile Fixing', 'Concrete Work', 'Foundation', 'Wall Construction', 'Flooring', 'Waterproofing'],
  'AC Technician': ['Installation', 'Repair', 'Gas Refilling', 'Servicing', 'Duct Cleaning', 'Split AC', 'Window AC', 'Central AC'],
  'Welder': ['Arc Welding', 'MIG Welding', 'TIG Welding', 'Gas Welding', 'Fabrication', 'Grills', 'Gates', 'Structural'],
  'Tiler': ['Floor Tiling', 'Wall Tiling', 'Bathroom Tiling', 'Kitchen Tiling', 'Marble Fixing', 'Granite Fixing', 'Mosaic', 'Outdoor Tiling'],
  'Cleaner': ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Sofa Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Window Cleaning'],
  'Gardener': ['Lawn Care', 'Plant Care', 'Tree Trimming', 'Landscaping', 'Garden Design', 'Irrigation', 'Pest Control', 'Seasonal Planting'],
};

const bios = [
  'Experienced professional with a passion for quality work. Customer satisfaction is my priority.',
  'Skilled craftsman with years of experience. I take pride in delivering excellent results.',
  'Dedicated worker committed to providing the best service. Available for all types of projects.',
  'Professional with expertise in residential and commercial projects. Quality guaranteed.',
  'Hardworking and reliable. I believe in doing the job right the first time.',
  'Expert in my field with a track record of satisfied customers. Let me help you today.',
  'Trained professional offering top-notch services at competitive rates.',
  'Passionate about my work and committed to exceeding customer expectations.',
];

// City coordinates for realistic location data
const CITY_COORDINATES: { [key: string]: { latitude: number; longitude: number } } = {
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Delhi': { latitude: 28.7041, longitude: 77.1025 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
  'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
  'Jaipur': { latitude: 26.9124, longitude: 75.7873 },
  'Surat': { latitude: 21.1702, longitude: 72.8311 },
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface DummyWorker {
  id: string;
  user_id: string;
  name: string;
  profile_photo_url: string;
  phone: string;
  primary_category: string;
  sub_skills: string[];
  city: string;
  locality: string;
  state: string;
  years_of_experience: number;
  daily_wage_min: number;
  daily_wage_max: number;
  monthly_rate_min: number;
  monthly_rate_max: number;
  rating_average: number;
  rating_count: number;
  kyc_status: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED';
  languages: string[];
  bio: string;
  availability_type: string;
  travel_willingness: boolean;
  travel_radius_km: number;
  is_featured: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  availability_status: 'AVAILABLE' | 'BUSY';
}

export function generateDummyWorkers(count: number = 100): DummyWorker[] {
  const workers: DummyWorker[] = [];

  for (let i = 0; i < count; i++) {
    const category = getRandomElement(CATEGORIES);
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const experience = getRandomNumber(1, 25);
    const baseWage = getRandomNumber(400, 800);
    const ratingAvg = (getRandomNumber(30, 50) / 10);
    const kycStatuses: ('NOT_VERIFIED' | 'PENDING' | 'VERIFIED')[] = ['NOT_VERIFIED', 'PENDING', 'VERIFIED'];
    const availabilityTypes = ['FULL_TIME', 'PART_TIME', 'DAILY_WAGE', 'CONTRACT'];
    const city = getRandomElement(INDIAN_CITIES);
    const cityCoords = CITY_COORDINATES[city] || CITY_COORDINATES['Mumbai'];
    
    // Add random offset to coordinates (within ~5km)
    const latOffset = (Math.random() - 0.5) * 0.09; // ~5km in latitude
    const lonOffset = (Math.random() - 0.5) * 0.09; // ~5km in longitude

    workers.push({
      id: `worker-${i + 1}`,
      user_id: `user-${i + 1}`,
      name: `${firstName} ${lastName}`,
      profile_photo_url: WORKER_IMAGES[i % WORKER_IMAGES.length],
      phone: `+91${getRandomNumber(7000000000, 9999999999)}`,
      primary_category: category.name,
      sub_skills: getRandomElements(
        subSkillsByCategory[category.name] || ['General Work', 'Maintenance', 'Installation', 'Repair'],
        getRandomNumber(2, 5)
      ),
      city: city,
      locality: `Sector ${getRandomNumber(1, 50)}`,
      state: 'Maharashtra',
      years_of_experience: experience,
      daily_wage_min: baseWage,
      daily_wage_max: baseWage + getRandomNumber(100, 300),
      monthly_rate_min: baseWage * 26,
      monthly_rate_max: (baseWage + 300) * 26,
      rating_average: Math.round(ratingAvg * 10) / 10,
      rating_count: getRandomNumber(5, 200),
      kyc_status: getRandomElement(kycStatuses),
      languages: getRandomElements(LANGUAGES.slice(0, 5), getRandomNumber(1, 3)),
      bio: getRandomElement(bios),
      availability_type: getRandomElement(availabilityTypes),
      travel_willingness: Math.random() > 0.3,
      travel_radius_km: getRandomNumber(5, 50),
      is_featured: Math.random() > 0.8,
      location: {
        latitude: cityCoords.latitude + latOffset,
        longitude: cityCoords.longitude + lonOffset,
      },
      availability_status: Math.random() > 0.3 ? 'AVAILABLE' : 'BUSY',
    });
  }

  return workers;
}

// Pre-generated workers for the app
export const DUMMY_WORKERS = generateDummyWorkers(100);

// Featured workers (top rated)
export const FEATURED_WORKERS = DUMMY_WORKERS
  .filter(w => w.rating_average >= 4.5 && w.kyc_status === 'VERIFIED')
  .slice(0, 10);

// Get workers by category
export function getWorkersByCategory(category: string): DummyWorker[] {
  return DUMMY_WORKERS.filter(w => w.primary_category === category);
}

// Search workers
export function searchWorkers(
  query: string,
  filters: {
    category?: string;
    city?: string;
    minExperience?: number;
    maxWage?: number;
    minRating?: number;
    verifiedOnly?: boolean;
  } = {}
): DummyWorker[] {
  let results = [...DUMMY_WORKERS];

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      w =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.primary_category.toLowerCase().includes(lowerQuery) ||
        w.city.toLowerCase().includes(lowerQuery) ||
        w.sub_skills.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }

  // Category filter
  if (filters.category) {
    results = results.filter(w => w.primary_category === filters.category);
  }

  // City filter
  if (filters.city) {
    results = results.filter(w => w.city === filters.city);
  }

  // Experience filter
  if (filters.minExperience) {
    results = results.filter(w => w.years_of_experience >= filters.minExperience!);
  }

  // Wage filter
  if (filters.maxWage) {
    results = results.filter(w => w.daily_wage_min <= filters.maxWage!);
  }

  // Rating filter
  if (filters.minRating) {
    results = results.filter(w => w.rating_average >= filters.minRating!);
  }

  // Verified only
  if (filters.verifiedOnly) {
    results = results.filter(w => w.kyc_status === 'VERIFIED');
  }

  return results;
}
