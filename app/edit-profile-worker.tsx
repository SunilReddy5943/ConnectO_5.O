/**
 * Edit Worker Profile
 * ===================
 * Full profile editing for Worker users.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Switch,
} from 'react-native';
// Note: @react-native-community/slider needs to be installed
// For now using a simpler approach
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import ProfilePhotoUploader from './components/profile/ProfilePhotoUploader';
import SectionHeader from './components/profile/SectionHeader';
import DaySelector from './components/profile/DaySelector';
import SkillSelector from './components/profile/SkillSelector';
import {
    WorkerProfile,
    WorkerProfileUpdate,
    DayOfWeek,
    PriceType,
    PROFILE_VALIDATION,
} from './lib/profileTypes';
import {
    getWorkerProfile,
    updateWorkerProfile,
    uploadProfilePhoto,
} from './lib/profileRepository';

export default function EditWorkerProfileScreen() {
    const router = useRouter();
    const { user, updateUser, setWorkerAvailability } = useAuth();

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);

    // Form state - Identity
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);

    // Form state - Professional
    const [primarySkill, setPrimarySkill] = useState('');
    const [subSkills, setSubSkills] = useState<string[]>([]);
    const [yearsOfExperience, setYearsOfExperience] = useState(0);
    const [bio, setBio] = useState('');

    // Form state - Availability
    const [availableToday, setAvailableToday] = useState(true);
    const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
    const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
    const [daysAvailable, setDaysAvailable] = useState<DayOfWeek[]>(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);

    // Form state - Location
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [serviceRadius, setServiceRadius] = useState(10);

    // Form state - Pricing
    const [startingPrice, setStartingPrice] = useState('');
    const [priceType, setPriceType] = useState<PriceType>('DAILY');

    // Original profile for dirty checking
    const [originalProfile, setOriginalProfile] = useState<WorkerProfile | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        const response = await getWorkerProfile(user.id);

        if (response.success && response.data) {
            const profile = response.data;
            setOriginalProfile(profile);
            setFullName(profile.fullName);
            setEmail(profile.email || '');
            setPrimarySkill(profile.primarySkill);
            setSubSkills(profile.subSkills);
            setYearsOfExperience(profile.yearsOfExperience);
            setBio(profile.bio);
            setAvailableToday(profile.availability.availableToday);
            setWorkingHoursStart(profile.availability.workingHoursStart);
            setWorkingHoursEnd(profile.availability.workingHoursEnd);
            setDaysAvailable(profile.availability.daysAvailable);
            setCity(profile.baseLocation.city);
            setArea(profile.baseLocation.area);
            setServiceRadius(profile.serviceRadiusKm);
            if (profile.pricing) {
                setStartingPrice(profile.pricing.startingPrice.toString());
                setPriceType(profile.pricing.priceType);
            }
        }

        setIsLoading(false);
    };

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!originalProfile) return false;

        return (
            fullName !== originalProfile.fullName ||
            email !== (originalProfile.email || '') ||
            primarySkill !== originalProfile.primarySkill ||
            JSON.stringify(subSkills) !== JSON.stringify(originalProfile.subSkills) ||
            yearsOfExperience !== originalProfile.yearsOfExperience ||
            bio !== originalProfile.bio ||
            availableToday !== originalProfile.availability.availableToday ||
            workingHoursStart !== originalProfile.availability.workingHoursStart ||
            workingHoursEnd !== originalProfile.availability.workingHoursEnd ||
            JSON.stringify(daysAvailable) !== JSON.stringify(originalProfile.availability.daysAvailable) ||
            city !== originalProfile.baseLocation.city ||
            area !== originalProfile.baseLocation.area ||
            serviceRadius !== originalProfile.serviceRadiusKm ||
            pendingPhotoUri !== null
        );
    }, [fullName, email, primarySkill, subSkills, yearsOfExperience, bio, availableToday, workingHoursStart, workingHoursEnd, daysAvailable, city, area, serviceRadius, pendingPhotoUri, originalProfile]);

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (fullName.length < PROFILE_VALIDATION.NAME_MIN_LENGTH) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!primarySkill) {
            newErrors.primarySkill = 'Please select a primary skill';
        }

        if (bio.length > PROFILE_VALIDATION.BIO_MAX_LENGTH) {
            newErrors.bio = `Bio must be under ${PROFILE_VALIDATION.BIO_MAX_LENGTH} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle photo selection
    const handlePhotoSelected = (uri: string) => {
        setPendingPhotoUri(uri);
    };

    // Handle save
    const handleSave = async () => {
        if (!validate()) return;
        if (!user?.id) return;

        setIsSaving(true);

        try {
            // Upload photo first if changed
            let photoUrl: string | undefined;
            if (pendingPhotoUri) {
                setIsPhotoUploading(true);
                const uploadedUrl = await uploadProfilePhoto(pendingPhotoUri, user.id);
                if (uploadedUrl) {
                    photoUrl = uploadedUrl;
                }
                setIsPhotoUploading(false);
            }

            // Build update object
            const updates: WorkerProfileUpdate = {
                fullName,
                email: email || undefined,
                profilePhotoUrl: photoUrl,
                primarySkill,
                subSkills,
                yearsOfExperience,
                bio,
                availability: {
                    availableToday,
                    workingHoursStart,
                    workingHoursEnd,
                    daysAvailable,
                },
                baseLocation: { city, area },
                serviceRadiusKm: serviceRadius,
                pricing: startingPrice ? {
                    startingPrice: parseFloat(startingPrice),
                    priceType,
                } : undefined,
            };

            const response = await updateWorkerProfile(user.id, updates);

            if (response.success) {
                // Update local user state
                updateUser({
                    name: fullName,
                    profile_photo_url: photoUrl || user.profile_photo_url,
                });

                // Update availability toggle
                await setWorkerAvailability(availableToday ? 'AVAILABLE' : 'BUSY');

                setPendingPhotoUri(null);
                setOriginalProfile(response.data || null);

                Alert.alert('Success', 'Your profile has been updated!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', response.error || 'Failed to update profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Photo */}
                    <ProfilePhotoUploader
                        currentPhotoUrl={pendingPhotoUri || user?.profile_photo_url}
                        onPhotoSelected={handlePhotoSelected}
                        isLoading={isPhotoUploading}
                    />

                    {/* Identity */}
                    <SectionHeader title="Identity" icon="person-outline" />

                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={fullName}
                        onChangeText={setFullName}
                        error={errors.fullName}
                        leftIcon="person"
                    />

                    <Input
                        label="Phone Number"
                        placeholder={user?.phone || ''}
                        value={user?.phone || ''}
                        onChangeText={() => { }}
                        leftIcon="call"
                        editable={false}
                    />

                    <Input
                        label="Email (Optional)"
                        placeholder="Enter email address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                    />

                    {/* Professional Info */}
                    <SectionHeader title="Professional Info" icon="briefcase-outline" />

                    <SkillSelector
                        primarySkill={primarySkill}
                        subSkills={subSkills}
                        onPrimaryChange={setPrimarySkill}
                        onSubSkillsChange={setSubSkills}
                    />

                    <Input
                        label="Years of Experience"
                        placeholder="0"
                        value={yearsOfExperience.toString()}
                        onChangeText={(text) => setYearsOfExperience(parseInt(text) || 0)}
                        keyboardType="numeric"
                        leftIcon="time"
                    />

                    <Input
                        label={`Short Bio (${bio.length}/${PROFILE_VALIDATION.BIO_MAX_LENGTH})`}
                        placeholder="Tell customers about yourself..."
                        value={bio}
                        onChangeText={setBio}
                        error={errors.bio}
                        multiline
                        numberOfLines={3}
                        maxLength={PROFILE_VALIDATION.BIO_MAX_LENGTH}
                    />

                    {/* Availability */}
                    <SectionHeader title="Availability" icon="calendar-outline" />

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Available Today</Text>
                            <Text style={styles.toggleSubtitle}>Show as available for work</Text>
                        </View>
                        <Switch
                            value={availableToday}
                            onValueChange={setAvailableToday}
                            trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
                            thumbColor={availableToday ? COLORS.success : COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.timeRow}>
                        <View style={styles.timeField}>
                            <Text style={styles.fieldLabel}>Start Time</Text>
                            <TouchableOpacity style={styles.timeButton}>
                                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.timeText}>{workingHoursStart}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeField}>
                            <Text style={styles.fieldLabel}>End Time</Text>
                            <TouchableOpacity style={styles.timeButton}>
                                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.timeText}>{workingHoursEnd}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <DaySelector
                        label="Days Available"
                        selected={daysAvailable}
                        onChange={setDaysAvailable}
                    />

                    {/* Location & Service Area */}
                    <SectionHeader title="Location & Service Area" icon="location-outline" />

                    <Input
                        label="Base City"
                        placeholder="Enter your city"
                        value={city}
                        onChangeText={setCity}
                        leftIcon="business"
                    />

                    <Input
                        label="Area"
                        placeholder="Enter your area"
                        value={area}
                        onChangeText={setArea}
                        leftIcon="navigate"
                    />

                    <View style={styles.sliderContainer}>
                        <Text style={styles.fieldLabel}>Service Radius: {serviceRadius} km</Text>
                        <View style={styles.radiusButtonsRow}>
                            <TouchableOpacity
                                style={styles.radiusButton}
                                onPress={() => setServiceRadius(Math.max(1, serviceRadius - 5))}
                            >
                                <Ionicons name="remove" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                            <View style={styles.radiusValue}>
                                <Text style={styles.radiusValueText}>{serviceRadius} km</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.radiusButton}
                                onPress={() => setServiceRadius(Math.min(50, serviceRadius + 5))}
                            >
                                <Ionicons name="add" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>1 km</Text>
                            <Text style={styles.sliderLabel}>50 km</Text>
                        </View>
                    </View>

                    {/* Pricing */}
                    <SectionHeader title="Pricing (Optional)" icon="pricetag-outline" />

                    <Input
                        label="Starting Price (₹)"
                        placeholder="e.g., 500"
                        value={startingPrice}
                        onChangeText={setStartingPrice}
                        keyboardType="numeric"
                        leftIcon="cash"
                    />

                    <Text style={styles.fieldLabel}>Price Type</Text>
                    <View style={styles.optionsRow}>
                        {(['HOURLY', 'FIXED', 'DAILY'] as PriceType[]).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.optionChip,
                                    priceType === type && styles.optionChipSelected,
                                ]}
                                onPress={() => setPriceType(type)}
                            >
                                <Text
                                    style={[
                                        styles.optionChipText,
                                        priceType === type && styles.optionChipTextSelected,
                                    ]}
                                >
                                    {type === 'HOURLY' ? 'Per Hour' : type === 'FIXED' ? 'Fixed' : 'Per Day'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bottom padding */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Sticky Save Button */}
                <View style={styles.saveButtonContainer}>
                    <Button
                        title={isSaving ? 'Saving...' : 'Save Changes'}
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={!hasChanges || isSaving}
                        style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        ...SHADOWS.sm,
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    loadingText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textMuted,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    fieldLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        marginTop: SPACING.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        marginBottom: SPACING.md,
    },
    toggleInfo: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    toggleSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    timeRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    timeField: {
        flex: 1,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    timeText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    sliderContainer: {
        marginBottom: SPACING.base,
    },
    radiusButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.lg,
        marginVertical: SPACING.md,
    },
    radiusButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radiusValue: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    radiusValueText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.primary,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    optionChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.borderLight,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    optionChipSelected: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    optionChipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    optionChipTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    saveButtonContainer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.md,
    },
    saveButton: {
        borderRadius: BORDER_RADIUS.lg,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
});
