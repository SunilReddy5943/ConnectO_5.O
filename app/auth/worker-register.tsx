import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, CATEGORIES, INDIAN_CITIES, LANGUAGES } from '../constants/theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const STEPS = ['Personal', 'Work', 'Location', 'Wages', 'Portfolio'];

const SUB_SKILLS: { [key: string]: string[] } = {
  'Plumber': ['Bathroom Plumbing', 'Kitchen Plumbing', 'Pipe Fitting', 'Water Heater', 'Leak Repair', 'Drain Cleaning'],
  'Electrician': ['Wiring', 'Switchboard', 'Fan Installation', 'Light Fitting', 'MCB/ELCB', 'Inverter'],
  'Carpenter': ['Furniture Making', 'Door Fitting', 'Modular Kitchen', 'Wardrobe', 'False Ceiling', 'Wood Polish'],
  'Painter': ['Interior Painting', 'Exterior Painting', 'Texture Painting', 'POP Work', 'Waterproofing'],
  'Mason': ['Brickwork', 'Plastering', 'Tile Fixing', 'Concrete Work', 'Foundation', 'Flooring'],
  'AC Technician': ['Installation', 'Repair', 'Gas Refilling', 'Servicing', 'Split AC', 'Window AC'],
};

export default function WorkerRegisterScreen() {
  const router = useRouter();
  const { login, user, updateUser } = useAuth();
  const { requestPermission, userLocation } = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Personal Info - prefill from existing user if available
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone?.replace('+91', '') || '');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Work Details
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi']);
  const [bio, setBio] = useState('');

  // Location
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [travelWillingness, setTravelWillingness] = useState(false);
  const [travelRadius, setTravelRadius] = useState('10');

  // Wages
  const [dailyWageMin, setDailyWageMin] = useState('');
  const [dailyWageMax, setDailyWageMax] = useState('');
  const [monthlyRateMin, setMonthlyRateMin] = useState('');
  const [monthlyRateMax, setMonthlyRateMax] = useState('');
  const [availabilityType, setAvailabilityType] = useState('FULL_TIME');

  // Portfolio
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [idProofUploaded, setIdProofUploaded] = useState(false);

  const calculateCompleteness = () => {
    let completed = 0;
    let total = 15;
    if (name) completed++;
    if (phone) completed++;
    if (gender) completed++;
    if (dob) completed++;
    if (primaryCategory) completed++;
    if (selectedSkills.length > 0) completed++;
    if (experience) completed++;
    if (city) completed++;
    if (locality) completed++;
    if (pincode) completed++;
    if (dailyWageMin) completed++;
    if (dailyWageMax) completed++;
    if (availabilityType) completed++;
    if (bio) completed++;
    if (portfolioImages.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      if (user) {
        // Update existing user to add WORKER role
        const updatedRoles = user.roles.includes('WORKER') 
          ? user.roles 
          : [...user.roles, 'WORKER', 'CUSTOMER'];
        
        await login({
          ...user,
          name: name || user.name,
          roles: updatedRoles as ('WORKER' | 'CUSTOMER')[],
          primaryRole: 'WORKER', // Set WORKER as primary
          activeRole: 'WORKER', // Activate WORKER mode
          is_active: true,
        });
      } else {
        // Create new worker user (fallback)
        await login({
          id: 'worker-' + Date.now(),
          phone: '+91' + phone,
          name: name,
          roles: ['WORKER', 'CUSTOMER'], // Worker gets both roles
          primaryRole: 'WORKER',
          activeRole: 'WORKER',
          is_active: true,
        });
      }
      setIsLoading(false);
      Alert.alert('Success', 'Your worker profile has been created!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }, 1500);
  };

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      // Request location permission and get current location
      const granted = await requestPermission();
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in settings to use this feature.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Wait a bit for location to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userLocation) {
        // Auto-fill location fields
        setCity(userLocation.city);
        setLocality(userLocation.area || `${userLocation.city} Area`);
        setState(userLocation.country === 'India' ? 'Maharashtra' : userLocation.country);
        
        // Generate a dummy pincode based on city (in production, would reverse geocode)
        const pincodes: { [key: string]: string } = {
          'Mumbai': '400001',
          'Delhi': '110001',
          'Bangalore': '560001',
          'Hyderabad': '500001',
          'Chennai': '600001',
          'Kolkata': '700001',
          'Pune': '411001',
          'Ahmedabad': '380001',
          'Jaipur': '302001',
          'Surat': '395001',
        };
        setPincode(pincodes[userLocation.city] || '400001');
        
        Alert.alert(
          'Location Detected! 📍',
          `Your location has been auto-filled:\n${userLocation.city}, ${userLocation.area}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Not Available',
          'Could not fetch your current location. Please enter manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const addPortfolioImage = () => {
    const demoImages = [
      'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517906698_8f08fe5c.png',
      'https://d64gsuwffb70l.cloudfront.net/693ba924daf5d915fe7d6985_1765517902391_581fbe64.jpg',
    ];
    if (portfolioImages.length < 6) {
      setPortfolioImages([...portfolioImages, demoImages[portfolioImages.length % 2]]);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {STEPS.map((step, index) => (
          <React.Fragment key={step}>
            <View style={[styles.progressDot, index <= currentStep && styles.progressDotActive]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={[styles.progressDotText, index <= currentStep && styles.progressDotTextActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.progressLine, index < currentStep && styles.progressLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {STEPS.map((step, index) => (
          <Text key={step} style={[styles.progressLabel, index === currentStep && styles.progressLabelActive]}>
            {step}
          </Text>
        ))}
      </View>
      <View style={styles.completenessContainer}>
        <Text style={styles.completenessText}>Profile: {calculateCompleteness()}% complete</Text>
        <View style={styles.completenessBar}>
          <View style={[styles.completenessFill, { width: `${calculateCompleteness()}%` }]} />
        </View>
      </View>
    </View>
  );

  const renderPersonalStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <TouchableOpacity style={styles.photoUpload} onPress={() => setProfilePhoto('uploaded')}>
        {profilePhoto ? (
          <View style={styles.photoUploaded}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
            <Text style={styles.photoUploadedText}>Photo Added</Text>
          </View>
        ) : (
          <>
            <Ionicons name="camera" size={32} color={COLORS.textMuted} />
            <Text style={styles.photoUploadText}>Add Profile Photo</Text>
          </>
        )}
      </TouchableOpacity>

      <Input label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} leftIcon="person-outline" />
      <Input label="Phone Number" placeholder="10-digit mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} leftIcon="call-outline" />
      
      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.optionsRow}>
        {['Male', 'Female', 'Other'].map((g) => (
          <TouchableOpacity key={g} style={[styles.optionChip, gender === g && styles.optionChipActive]} onPress={() => setGender(g)}>
            <Text style={[styles.optionChipText, gender === g && styles.optionChipTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Date of Birth" placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} leftIcon="calendar-outline" />
    </View>
  );

  const renderWorkStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Work Details</Text>
      <Text style={styles.stepSubtitle}>What work do you do?</Text>

      <Text style={styles.fieldLabel}>Primary Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.slice(0, 12).map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.categoryChip, primaryCategory === cat.name && styles.categoryChipActive]} onPress={() => setPrimaryCategory(cat.name)}>
            <Ionicons name={cat.icon as any} size={20} color={primaryCategory === cat.name ? COLORS.white : cat.color} />
            <Text style={[styles.categoryChipText, primaryCategory === cat.name && styles.categoryChipTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {primaryCategory && SUB_SKILLS[primaryCategory] && (
        <>
          <Text style={styles.fieldLabel}>Sub-Skills (Select all that apply)</Text>
          <View style={styles.skillsGrid}>
            {SUB_SKILLS[primaryCategory].map((skill) => (
              <TouchableOpacity key={skill} style={[styles.skillChip, selectedSkills.includes(skill) && styles.skillChipActive]} onPress={() => toggleSkill(skill)}>
                <Text style={[styles.skillChipText, selectedSkills.includes(skill) && styles.skillChipTextActive]}>{skill}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Input label="Years of Experience" placeholder="e.g., 5" value={experience} onChangeText={setExperience} keyboardType="numeric" leftIcon="briefcase-outline" />

      <Text style={styles.fieldLabel}>Languages Known</Text>
      <View style={styles.skillsGrid}>
        {LANGUAGES.slice(0, 8).map((lang) => (
          <TouchableOpacity key={lang} style={[styles.skillChip, selectedLanguages.includes(lang) && styles.skillChipActive]} onPress={() => toggleLanguage(lang)}>
            <Text style={[styles.skillChipText, selectedLanguages.includes(lang) && styles.skillChipTextActive]}>{lang}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Bio (Optional)" placeholder="Describe your work experience..." value={bio} onChangeText={setBio} multiline numberOfLines={3} />
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepSubtitle}>Where are you based?</Text>

      <TouchableOpacity 
        style={[styles.gpsButton, isLoadingLocation && styles.gpsButtonLoading]} 
        onPress={handleGetLocation}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.gpsButtonText}>Fetching location...</Text>
          </>
        ) : (
          <>
            <Ionicons name="locate" size={20} color={COLORS.primary} />
            <Text style={styles.gpsButtonText}>Use Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      <Input label="City" placeholder="Enter your city" value={city} onChangeText={setCity} leftIcon="location-outline" />
      <Input label="Locality / Area" placeholder="Enter your locality" value={locality} onChangeText={setLocality} leftIcon="navigate-outline" />
      <Input label="Pincode" placeholder="6-digit pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} leftIcon="map-outline" />
      <Input label="State" placeholder="Enter your state" value={state} onChangeText={setState} leftIcon="flag-outline" />

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Willing to Travel for Work?</Text>
          <Text style={styles.toggleSubtext}>Get jobs from nearby areas</Text>
        </View>
        <TouchableOpacity style={[styles.toggle, travelWillingness && styles.toggleActive]} onPress={() => setTravelWillingness(!travelWillingness)}>
          <View style={[styles.toggleKnob, travelWillingness && styles.toggleKnobActive]} />
        </TouchableOpacity>
      </View>

      {travelWillingness && (
        <Input label="Travel Radius (km)" placeholder="e.g., 20" value={travelRadius} onChangeText={setTravelRadius} keyboardType="numeric" leftIcon="car-outline" />
      )}
    </View>
  );

  const renderWagesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Wage Expectations</Text>
      <Text style={styles.stepSubtitle}>Set your rates</Text>

      <Text style={styles.fieldLabel}>Availability Type</Text>
      <View style={styles.optionsRow}>
        {[
          { value: 'FULL_TIME', label: 'Full Time' },
          { value: 'PART_TIME', label: 'Part Time' },
          { value: 'DAILY_WAGE', label: 'Daily Wage' },
          { value: 'CONTRACT', label: 'Contract' },
        ].map((opt) => (
          <TouchableOpacity key={opt.value} style={[styles.optionChip, availabilityType === opt.value && styles.optionChipActive]} onPress={() => setAvailabilityType(opt.value)}>
            <Text style={[styles.optionChipText, availabilityType === opt.value && styles.optionChipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Daily Wage Range (₹)</Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeInput}>
          <Input placeholder="Min" value={dailyWageMin} onChangeText={setDailyWageMin} keyboardType="numeric" />
        </View>
        <Text style={styles.rangeSeparator}>to</Text>
        <View style={styles.rangeInput}>
          <Input placeholder="Max" value={dailyWageMax} onChangeText={setDailyWageMax} keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Monthly Rate Range (₹) - Optional</Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeInput}>
          <Input placeholder="Min" value={monthlyRateMin} onChangeText={setMonthlyRateMin} keyboardType="numeric" />
        </View>
        <Text style={styles.rangeSeparator}>to</Text>
        <View style={styles.rangeInput}>
          <Input placeholder="Max" value={monthlyRateMax} onChangeText={setMonthlyRateMax} keyboardType="numeric" />
        </View>
      </View>
    </View>
  );

  const renderPortfolioStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Portfolio & Documents</Text>
      <Text style={styles.stepSubtitle}>Showcase your work</Text>

      <Text style={styles.fieldLabel}>Portfolio Images ({portfolioImages.length}/6)</Text>
      <View style={styles.portfolioGrid}>
        {portfolioImages.map((img, index) => (
          <View key={index} style={styles.portfolioItem}>
            <Image source={{ uri: img }} style={styles.portfolioImage} />
            <TouchableOpacity style={styles.removeButton} onPress={() => setPortfolioImages(prev => prev.filter((_, i) => i !== index))}>
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}
        {portfolioImages.length < 6 && (
          <TouchableOpacity style={styles.addPortfolioButton} onPress={addPortfolioImage}>
            <Ionicons name="add" size={32} color={COLORS.textMuted} />
            <Text style={styles.addPortfolioText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.kycSection}>
        <Text style={styles.fieldLabel}>KYC Document (ID Proof)</Text>
        <Text style={styles.kycSubtext}>Upload Aadhaar, PAN, or Voter ID for verification</Text>
        <TouchableOpacity style={[styles.kycUploadButton, idProofUploaded && styles.kycUploadButtonDone]} onPress={() => setIdProofUploaded(true)}>
          <Ionicons name={idProofUploaded ? 'checkmark-circle' : 'document-outline'} size={24} color={idProofUploaded ? COLORS.success : COLORS.primary} />
          <Text style={[styles.kycUploadText, idProofUploaded && styles.kycUploadTextDone]}>
            {idProofUploaded ? 'Document Uploaded' : 'Upload Document'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.kycNote}>Your documents are secure and only visible to admins for verification.</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalStep();
      case 1: return renderWorkStep();
      case 2: return renderLocationStep();
      case 3: return renderWagesStep();
      case 4: return renderPortfolioStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Worker Registration</Text>
          <View style={styles.placeholder} />
        </View>

        {renderProgressBar()}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 0 && (
            <Button title="Previous" variant="outline" onPress={() => setCurrentStep(currentStep - 1)} style={styles.prevButton} />
          )}
          <Button
            title={currentStep === STEPS.length - 1 ? 'Submit' : 'Next'}
            onPress={handleNext}
            loading={isLoading}
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.white },
  backButton: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  placeholder: { width: 40 },
  progressContainer: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  progressBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: COLORS.primary },
  progressDotText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMuted },
  progressDotTextActive: { color: COLORS.white },
  progressLine: { width: 40, height: 3, backgroundColor: COLORS.borderLight, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: COLORS.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, width: 60, textAlign: 'center' },
  progressLabelActive: { color: COLORS.primary, fontWeight: '600' },
  completenessContainer: { marginTop: SPACING.md },
  completenessText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  completenessBar: { height: 6, backgroundColor: COLORS.borderLight, borderRadius: 3, overflow: 'hidden' },
  completenessFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 3 },
  scrollView: { flex: 1 },
  stepContent: { padding: SPACING.base },
  stepTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  stepSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  photoUpload: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: SPACING.lg, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed' },
  photoUploaded: { alignItems: 'center' },
  photoUploadedText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, marginTop: SPACING.xs },
  photoUploadText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.md },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.borderLight },
  optionChipActive: { backgroundColor: COLORS.primary },
  optionChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  optionChipTextActive: { color: COLORS.white, fontWeight: '600' },
  categoryScroll: { marginBottom: SPACING.md },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.white, marginRight: SPACING.sm, ...SHADOWS.sm },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginLeft: SPACING.xs },
  categoryChipTextActive: { color: COLORS.white, fontWeight: '600' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  skillChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.borderLight },
  skillChipActive: { backgroundColor: COLORS.primary },
  skillChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  skillChipTextActive: { color: COLORS.white },
  gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '15', paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.lg },
  gpsButtonLoading: { opacity: 0.7 },
  gpsButtonText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.primary, marginLeft: SPACING.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginTop: SPACING.md, ...SHADOWS.sm },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: FONT_SIZES.base, fontWeight: '500', color: COLORS.textPrimary },
  toggleSubtext: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.border, padding: 2 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white },
  toggleKnobActive: { transform: [{ translateX: 22 }] },
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: { flex: 1 },
  rangeSeparator: { marginHorizontal: SPACING.md, color: COLORS.textMuted },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  portfolioItem: { position: 'relative' },
  portfolioImage: { width: 100, height: 100, borderRadius: BORDER_RADIUS.lg },
  removeButton: { position: 'absolute', top: -8, right: -8 },
  addPortfolioButton: { width: 100, height: 100, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed' },
  addPortfolioText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
  kycSection: { marginTop: SPACING.xl, backgroundColor: COLORS.white, padding: SPACING.base, borderRadius: BORDER_RADIUS.xl, ...SHADOWS.sm },
  kycSubtext: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.md },
  kycUploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
  kycUploadButtonDone: { borderColor: COLORS.success, backgroundColor: COLORS.success + '10', borderStyle: 'solid' },
  kycUploadText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.primary, marginLeft: SPACING.sm },
  kycUploadTextDone: { color: COLORS.success },
  kycNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.md, textAlign: 'center' },
  footer: { flexDirection: 'row', padding: SPACING.base, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.md },
  prevButton: { flex: 1 },
  nextButton: { flex: 2 },
});
