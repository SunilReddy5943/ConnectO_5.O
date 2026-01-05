// ConnectO Theme Constants
export const COLORS = {
  primary: '#1E40AF', // Deep blue
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  secondary: '#F97316', // Warm orange
  secondaryLight: '#FB923C',
  secondaryDark: '#EA580C',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#06B6D4',
  infoLight: '#CFFAFE',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',
  backgroundLight: '#F1F5F9',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#CBD5E1',
  textWhite: '#FFFFFF',

  // Status
  verified: '#10B981',
  pending: '#F59E0B',
  unverified: '#94A3B8',

  // Ratings
  star: '#FBBF24',
  starEmpty: '#E2E8F0',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Worker images for demo
export const WORKER_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517906698_8f08fe5c.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517902391_581fbe64.jpg',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517903128_8f234661.jpg',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517925249_db0e65c5.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517924698_e2e9bd6a.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517922651_f9e8f874.jpg',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517955764_45e0cbc1.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517952418_f2304b4e.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517951372_fad6a87f.png',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517968341_54015f85.jpg',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517970369_22e16dd3.jpg',
  'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517978620_59ef18ca.png',
];

export const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517887583_8beca5ae.png';

// Categories with icons
export const CATEGORIES = [
  { id: '1', name: 'Plumber', icon: 'water', color: '#3B82F6' },
  { id: '2', name: 'Electrician', icon: 'flash', color: '#F59E0B' },
  { id: '3', name: 'Carpenter', icon: 'construct', color: '#8B5CF6' },
  { id: '4', name: 'Painter', icon: 'color-palette', color: '#EC4899' },
  { id: '5', name: 'Mason', icon: 'cube', color: '#6B7280' },
  { id: '6', name: 'AC Technician', icon: 'snow', color: '#06B6D4' },
  { id: '7', name: 'Welder', icon: 'flame', color: '#EF4444' },
  { id: '8', name: 'Tiler', icon: 'grid', color: '#10B981' },
  { id: '9', name: 'Cleaner', icon: 'sparkles', color: '#14B8A6' },
  { id: '10', name: 'Gardener', icon: 'leaf', color: '#22C55E' },
  { id: '11', name: 'Driver', icon: 'car', color: '#64748B' },
  { id: '12', name: 'Appliance Repair', icon: 'settings', color: '#78716C' },
  { id: '13', name: 'Locksmith', icon: 'key', color: '#A855F7' },
  { id: '14', name: 'Pest Control', icon: 'bug', color: '#84CC16' },
  { id: '15', name: 'Glass Worker', icon: 'albums', color: '#0EA5E9' },
  { id: '16', name: 'Interior Fitter', icon: 'layers', color: '#D946EF' },
  { id: '17', name: 'False Ceiling', icon: 'expand', color: '#F97316' },
  { id: '18', name: 'Solar Installer', icon: 'sunny', color: '#FBBF24' },
  { id: '19', name: 'CCTV Installer', icon: 'videocam', color: '#1E40AF' },
  { id: '20', name: 'Waterproofing', icon: 'water-outline', color: '#0891B2' },
];

// Indian cities for demo
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli', 'Mysore',
];

// Languages
export const LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati',
  'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit',
];
