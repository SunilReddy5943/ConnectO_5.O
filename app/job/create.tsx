import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, CATEGORIES } from '../constants/theme';
import Input from '../components/ui/Input';
import TrustReassuranceBanner from '../components/TrustReassuranceBanner';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function CreateJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workerId?: string; category?: string }>();
  const { isAuthenticated, activeRole } = useAuth();
  const { addNotification } = useApp();

  const isWorkerMode = activeRole === 'WORKER';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(params.category || '');
  const [city, setCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [urgency, setUrgency] = useState<'URGENT' | 'NORMAL' | 'FLEXIBLE'>('NORMAL');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategories, setShowCategories] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = `${isWorkerMode ? 'Work' : 'Job'} title is required`;
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!budgetMin || !budgetMax) {
      newErrors.budget = 'Please enter budget range';
    } else if (parseInt(budgetMin) > parseInt(budgetMax)) {
      newErrors.budget = 'Minimum budget cannot be greater than maximum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!validate()) return;

    setIsLoading(true);

    // Simulate job/work creation
    setTimeout(() => {
      setIsLoading(false);
      
      const itemType = isWorkerMode ? 'Work' : 'Job';
      
      addNotification({
        id: Date.now().toString(),
        title: `${itemType} Posted Successfully!`,
        body: `Your ${itemType.toLowerCase()} "${title}" has been posted. ${isWorkerMode ? 'You will receive work requests soon.' : 'Workers will start applying soon.'}`,
        type: isWorkerMode ? 'WORK' : 'JOB',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      Alert.alert(
        `${itemType} Posted!`,
        `Your ${itemType.toLowerCase()} has been posted successfully. ${isWorkerMode ? 'Clients can now send you requests.' : 'Workers will start applying soon.'}`,
        [
          {
            text: `View ${isWorkerMode ? 'Works' : 'Jobs'}`,
            onPress: () => router.replace('/(tabs)/jobs'),
          },
        ]
      );
    }, 1500);
  };

  const urgencyOptions = [
    { value: 'URGENT', label: 'Urgent', icon: 'flash', color: COLORS.error },
    { value: 'NORMAL', label: 'Normal', icon: 'time', color: COLORS.info },
    { value: 'FLEXIBLE', label: 'Flexible', icon: 'calendar', color: COLORS.success },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isWorkerMode ? 'Post a Work' : 'Post a Job'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trust Reassurance */}
          <View style={styles.trustBannerContainer}>
            <TrustReassuranceBanner 
              message={isWorkerMode ? "Your work request will be visible to verified customers" : "Only verified workers can apply"}
              variant="info"
              icon="shield-checkmark"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isWorkerMode ? 'Work Details' : 'Job Details'}</Text>
            
            <Input
              label={isWorkerMode ? 'Work Title' : 'Job Title'}
              placeholder={isWorkerMode ? 'e.g., Kitchen Cabinet Installation Service' : 'e.g., Need plumber for bathroom leak repair'}
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Description"
              placeholder={isWorkerMode ? 'Describe the work you can do in detail...' : 'Describe the work needed in detail...'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              error={errors.description}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.category && styles.selectButtonError]}
                onPress={() => setShowCategories(!showCategories)}
              >
                {category ? (
                  <View style={styles.selectedCategory}>
                    <Ionicons
                      name={CATEGORIES.find(c => c.name === category)?.icon as any || 'construct'}
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.selectedCategoryText}>{category}</Text>
                  </View>
                ) : (
                  <Text style={styles.selectPlaceholder}>Select a category</Text>
                )}
                <Ionicons
                  name={showCategories ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              
              {showCategories && (
                <View style={styles.categoriesDropdown}>
                  {CATEGORIES.slice(0, 12).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, category === cat.name && styles.categoryOptionSelected]}
                      onPress={() => {
                        setCategory(cat.name);
                        setShowCategories(false);
                      }}
                    >
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                      <Text style={styles.categoryOptionText}>{cat.name}</Text>
                      {category === cat.name && (
                        <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <Input
              label="City"
              placeholder="Enter your city"
              value={city}
              onChangeText={setCity}
              leftIcon="location-outline"
              error={errors.city}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isWorkerMode ? 'Rate (₹)' : 'Budget (₹)'}</Text>
            
            <View style={styles.budgetRow}>
              <View style={styles.budgetInput}>
                <Input
                  label="Minimum"
                  placeholder="500"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.budgetSeparator}>to</Text>
              <View style={styles.budgetInput}>
                <Input
                  label="Maximum"
                  placeholder="2000"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urgency</Text>
            
            <View style={styles.urgencyOptions}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.urgencyOption,
                    urgency === option.value && styles.urgencyOptionSelected,
                    urgency === option.value && { borderColor: option.color },
                  ]}
                  onPress={() => setUrgency(option.value as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={urgency === option.value ? option.color : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.urgencyText,
                      urgency === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.submitContainer}>
            <Button
              title={isWorkerMode ? 'Post Work' : 'Post Job'}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
  },
  trustBannerContainer: {
    marginBottom: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.base,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  selectButtonError: {
    borderColor: COLORS.error,
  },
  selectPlaceholder: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  categoriesDropdown: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 250,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  categoryOptionText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  urgencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  urgencyOptionSelected: {
    backgroundColor: COLORS.white,
  },
  urgencyText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  submitContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
