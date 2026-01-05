/**
 * Edit Customer Profile
 * =====================
 * Full profile editing for Customer users.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import Input from './components/ui/Input';
import Button from './components/ui/Button';
import ProfilePhotoUploader from './components/profile/ProfilePhotoUploader';
import SectionHeader from './components/profile/SectionHeader';
import {
    CustomerProfile,
    CustomerProfileUpdate,
    ServiceTime,
    Language,
    SERVICE_TIMES,
    LANGUAGES,
    PROFILE_VALIDATION,
} from './lib/profileTypes';
import {
    getCustomerProfile,
    updateCustomerProfile,
    uploadProfilePhoto,
} from './lib/profileRepository';

export default function EditCustomerProfileScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuth();

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [serviceTime, setServiceTime] = useState<ServiceTime>('ANYTIME');
    const [language, setLanguage] = useState<Language>('English');
    const [pushEnabled, setPushEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [marketingEnabled, setMarketingEnabled] = useState(false);
    const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);

    // Original profile for dirty checking
    const [originalProfile, setOriginalProfile] = useState<CustomerProfile | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        const response = await getCustomerProfile(user.id);

        if (response.success && response.data) {
            const profile = response.data;
            setOriginalProfile(profile);
            setFullName(profile.fullName);
            setEmail(profile.email || '');
            setCity(profile.location.city);
            setArea(profile.location.area);
            setServiceTime(profile.preferredServiceTime);
            setLanguage(profile.language);
            setPushEnabled(profile.notificationSettings.pushEnabled);
            setSmsEnabled(profile.notificationSettings.smsEnabled);
            setEmailEnabled(profile.notificationSettings.emailEnabled);
            setMarketingEnabled(profile.notificationSettings.marketingEnabled);
        }

        setIsLoading(false);
    };

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!originalProfile) return false;

        return (
            fullName !== originalProfile.fullName ||
            email !== (originalProfile.email || '') ||
            city !== originalProfile.location.city ||
            area !== originalProfile.location.area ||
            serviceTime !== originalProfile.preferredServiceTime ||
            language !== originalProfile.language ||
            pushEnabled !== originalProfile.notificationSettings.pushEnabled ||
            smsEnabled !== originalProfile.notificationSettings.smsEnabled ||
            emailEnabled !== originalProfile.notificationSettings.emailEnabled ||
            marketingEnabled !== originalProfile.notificationSettings.marketingEnabled ||
            pendingPhotoUri !== null
        );
    }, [fullName, email, city, area, serviceTime, language, pushEnabled, smsEnabled, emailEnabled, marketingEnabled, pendingPhotoUri, originalProfile]);

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (fullName.length < PROFILE_VALIDATION.NAME_MIN_LENGTH) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (email && !PROFILE_VALIDATION.EMAIL_REGEX.test(email)) {
            newErrors.email = 'Please enter a valid email';
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
            const updates: CustomerProfileUpdate = {
                fullName,
                email: email || undefined,
                profilePhotoUrl: photoUrl,
                location: { city, area },
                preferredServiceTime: serviceTime,
                language,
                notificationSettings: {
                    pushEnabled,
                    smsEnabled,
                    emailEnabled,
                    marketingEnabled,
                },
            };

            const response = await updateCustomerProfile(user.id, updates);

            if (response.success) {
                // Update local user state
                updateUser({
                    name: fullName,
                    profile_photo_url: photoUrl || user.profile_photo_url,
                });

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

                    {/* Basic Info */}
                    <SectionHeader title="Basic Info" icon="person-outline" />

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
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                    />

                    {/* Location */}
                    <SectionHeader title="Location" icon="location-outline" />

                    <Input
                        label="City"
                        placeholder="Enter city"
                        value={city}
                        onChangeText={setCity}
                        leftIcon="business"
                    />

                    <Input
                        label="Area / Locality"
                        placeholder="Enter your area"
                        value={area}
                        onChangeText={setArea}
                        leftIcon="navigate"
                    />

                    {/* Preferences */}
                    <SectionHeader title="Preferences" icon="options-outline" />

                    <Text style={styles.fieldLabel}>Preferred Service Time</Text>
                    <View style={styles.optionsRow}>
                        {SERVICE_TIMES.map(time => (
                            <TouchableOpacity
                                key={time.value}
                                style={[
                                    styles.optionChip,
                                    serviceTime === time.value && styles.optionChipSelected,
                                ]}
                                onPress={() => setServiceTime(time.value)}
                            >
                                <Text
                                    style={[
                                        styles.optionChipText,
                                        serviceTime === time.value && styles.optionChipTextSelected,
                                    ]}
                                >
                                    {time.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Language</Text>
                    <View style={styles.optionsRow}>
                        {LANGUAGES.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[
                                    styles.optionChip,
                                    language === lang && styles.optionChipSelected,
                                ]}
                                onPress={() => setLanguage(lang)}
                            >
                                <Text
                                    style={[
                                        styles.optionChipText,
                                        language === lang && styles.optionChipTextSelected,
                                    ]}
                                >
                                    {lang}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Notifications */}
                    <SectionHeader title="Notifications" icon="notifications-outline" />

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Push Notifications</Text>
                            <Text style={styles.toggleSubtitle}>Get updates on your device</Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={pushEnabled ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>SMS Notifications</Text>
                            <Text style={styles.toggleSubtitle}>Receive SMS updates</Text>
                        </View>
                        <Switch
                            value={smsEnabled}
                            onValueChange={setSmsEnabled}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={smsEnabled ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Email Notifications</Text>
                            <Text style={styles.toggleSubtitle}>Receive email updates</Text>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={emailEnabled ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>

                    <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Marketing</Text>
                            <Text style={styles.toggleSubtitle}>Tips and promotional content</Text>
                        </View>
                        <Switch
                            value={marketingEnabled}
                            onValueChange={setMarketingEnabled}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={marketingEnabled ? COLORS.primary : COLORS.textMuted}
                        />
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
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
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
