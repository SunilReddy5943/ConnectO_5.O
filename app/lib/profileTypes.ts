/**
 * Profile Types
 * =============
 * Extended profile interfaces for Customer and Worker profiles.
 * Designed for role-based profile editing.
 */

// =============================================
// COMMON TYPES
// =============================================

export interface Location {
    city: string;
    area: string;
    latitude?: number;
    longitude?: number;
}

export type ServiceTime = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';
export type Language = 'English' | 'Hindi' | 'Bengali' | 'Telugu' | 'Marathi' | 'Tamil' | 'Other';
export type PriceType = 'HOURLY' | 'FIXED' | 'DAILY';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

// =============================================
// NOTIFICATION SETTINGS
// =============================================

export interface NotificationSettings {
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    marketingEnabled: boolean;
}

// =============================================
// CUSTOMER PROFILE
// =============================================

export interface CustomerProfile {
    // Basic Info
    userId: string;
    profilePhotoUrl?: string;
    fullName: string;
    phone: string;
    email?: string;

    // Location
    location: Location;

    // Preferences
    preferredServiceTime: ServiceTime;
    language: Language;
    notificationSettings: NotificationSettings;

    // Metadata
    createdAt: string;
    updatedAt: string;
}

export interface CustomerProfileUpdate {
    fullName?: string;
    email?: string;
    location?: Partial<Location>;
    preferredServiceTime?: ServiceTime;
    language?: Language;
    notificationSettings?: Partial<NotificationSettings>;
    profilePhotoUrl?: string;
}

// =============================================
// WORKER PROFILE
// =============================================

export interface WorkerAvailability {
    availableToday: boolean;
    workingHoursStart: string; // HH:MM format
    workingHoursEnd: string;
    daysAvailable: DayOfWeek[];
}

export interface WorkerPricing {
    startingPrice: number;
    priceType: PriceType;
}

export interface WorkerProfile {
    // Identity
    userId: string;
    profilePhotoUrl?: string;
    fullName: string;
    phone: string;
    email?: string;

    // Professional Info
    primarySkill: string;
    subSkills: string[];
    yearsOfExperience: number;
    bio: string;

    // Availability
    availability: WorkerAvailability;

    // Location & Service Area
    baseLocation: Location;
    serviceRadiusKm: number;

    // Pricing
    pricing?: WorkerPricing;

    // Verification
    verificationStatus: VerificationStatus;
    idDocumentUrl?: string;

    // Stats (read-only)
    ratingAverage: number;
    ratingCount: number;
    totalCompletedWorks: number;

    // Metadata
    createdAt: string;
    updatedAt: string;
}

export interface WorkerProfileUpdate {
    fullName?: string;
    email?: string;
    profilePhotoUrl?: string;
    primarySkill?: string;
    subSkills?: string[];
    yearsOfExperience?: number;
    bio?: string;
    availability?: Partial<WorkerAvailability>;
    baseLocation?: Partial<Location>;
    serviceRadiusKm?: number;
    pricing?: Partial<WorkerPricing>;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ProfileResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================
// FORM VALIDATION
// =============================================

export const PROFILE_VALIDATION = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 150,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SERVICE_RADIUS_MIN: 1,
    SERVICE_RADIUS_MAX: 50,
    EXPERIENCE_MAX: 50,
};

// =============================================
// SKILL OPTIONS
// =============================================

export const SKILLS = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason',
    'AC Technician', 'Welder', 'Tiler', 'Cleaner', 'Gardener',
    'Driver', 'Appliance Repair', 'Locksmith', 'Pest Control',
    'Glass Worker', 'Interior Fitter', 'False Ceiling', 'Solar Installer',
    'CCTV Installer', 'Waterproofing',
];

export const SUB_SKILLS: Record<string, string[]> = {
    'Plumber': ['Pipe Fitting', 'Leak Repair', 'Drain Cleaning', 'Bathroom Fitting', 'Water Heater'],
    'Electrician': ['Wiring', 'Switch/Socket', 'MCB/Fuse', 'Fan Installation', 'Lighting'],
    'Carpenter': ['Furniture Repair', 'Door Fitting', 'Cabinet Making', 'Wood Polish', 'Modular Kitchen'],
    'Painter': ['Interior Painting', 'Exterior Painting', 'Texture Painting', 'Wall Putty', 'Waterproofing'],
    'AC Technician': ['AC Installation', 'AC Repair', 'AC Service', 'Gas Refill', 'PCB Repair'],
};

export const LANGUAGES: Language[] = ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Other'];

export const SERVICE_TIMES: { value: ServiceTime; label: string }[] = [
    { value: 'MORNING', label: 'Morning (6AM - 12PM)' },
    { value: 'AFTERNOON', label: 'Afternoon (12PM - 5PM)' },
    { value: 'EVENING', label: 'Evening (5PM - 9PM)' },
    { value: 'ANYTIME', label: 'Anytime' },
];

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
    { value: 'MON', label: 'Monday', short: 'M' },
    { value: 'TUE', label: 'Tuesday', short: 'T' },
    { value: 'WED', label: 'Wednesday', short: 'W' },
    { value: 'THU', label: 'Thursday', short: 'T' },
    { value: 'FRI', label: 'Friday', short: 'F' },
    { value: 'SAT', label: 'Saturday', short: 'S' },
    { value: 'SUN', label: 'Sunday', short: 'S' },
];
