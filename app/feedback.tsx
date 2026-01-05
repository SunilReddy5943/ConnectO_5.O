/**
 * Feedback & Suggestions Screen
 * ==============================
 * Complete feedback page with form submission and history tabs.
 * Supports bug reports, feature requests, improvements, and general feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    FlatList,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './constants/theme';
import { useAuth } from './context/AuthContext';
import { useFeedback, FeedbackProvider } from './context/FeedbackContext';
import Button from './components/ui/Button';
import FeedbackTypeDropdown from './components/form/FeedbackTypeDropdown';
import StarRatingInput from './components/form/StarRatingInput';
import ScreenshotPicker from './components/form/ScreenshotPicker';
import FeedbackEmptyState from './components/FeedbackEmptyState';
import {
    FeedbackType,
    Feedback,
    FEEDBACK_TYPE_CONFIG,
    FEEDBACK_STATUS_CONFIG,
    VALIDATION,
} from './lib/feedbackTypes';

// =============================================
// MAIN SCREEN COMPONENT
// =============================================

function FeedbackScreenContent() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const {
        isSubmitting,
        submitError,
        submitSuccess,
        feedbackHistory,
        isLoadingHistory,
        hasMoreHistory,
        rateLimitRemaining,
        submit,
        loadHistory,
        resetSubmitState,
        checkRateLimit,
    } = useFeedback();

    // Tab state
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

    // Form state
    const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<{ type?: string; message?: string }>({});

    // Success animation
    const successScale = React.useRef(new Animated.Value(0)).current;
    const successOpacity = React.useRef(new Animated.Value(0)).current;

    // Load history when switching to history tab
    useEffect(() => {
        if (activeTab === 'history' && feedbackHistory.length === 0) {
            loadHistory(true);
        }
    }, [activeTab]);

    // Check rate limit on mount
    useEffect(() => {
        checkRateLimit();
    }, []);

    // Handle success animation
    useEffect(() => {
        if (submitSuccess) {
            Animated.parallel([
                Animated.spring(successScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 5,
                }),
                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Reset form after delay
            const timer = setTimeout(() => {
                resetForm();
                resetSubmitState();
                successScale.setValue(0);
                successOpacity.setValue(0);
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [submitSuccess]);

    const resetForm = () => {
        setFeedbackType(null);
        setMessage('');
        setRating(null);
        setScreenshotUri(null);
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: { type?: string; message?: string } = {};

        if (!feedbackType) {
            newErrors.type = 'Please select a feedback type';
        }

        if (!message.trim()) {
            newErrors.message = 'Please enter your feedback';
        } else if (message.trim().length < VALIDATION.MESSAGE_MIN_LENGTH) {
            newErrors.message = `Message must be at least ${VALIDATION.MESSAGE_MIN_LENGTH} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const success = await submit({
            feedbackType: feedbackType!,
            message: message.trim(),
            rating,
            screenshotUri,
        });

        if (success) {
            // Refresh rate limit
            checkRateLimit();
        }
    };

    const handleRefreshHistory = useCallback(() => {
        loadHistory(true);
    }, [loadHistory]);

    const handleLoadMore = useCallback(() => {
        if (!isLoadingHistory && hasMoreHistory) {
            loadHistory(false);
        }
    }, [isLoadingHistory, hasMoreHistory, loadHistory]);

    // Render login prompt for unauthenticated users
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Feedback & Suggestions</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.loginPrompt}>
                    <View style={styles.loginIconContainer}>
                        <Ionicons name="chatbubble-ellipses" size={64} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.loginTitle}>Login Required</Text>
                    <Text style={styles.loginSubtitle}>
                        Please log in to submit feedback and help us improve ConnectO
                    </Text>
                    <Button
                        title="Login"
                        onPress={() => router.push('/auth/login')}
                        style={styles.loginButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Render success overlay
    const renderSuccessOverlay = () => {
        if (!submitSuccess) return null;

        return (
            <Animated.View
                style={[
                    styles.successOverlay,
                    {
                        opacity: successOpacity,
                        transform: [{ scale: successScale }],
                    },
                ]}
            >
                <View style={styles.successContent}>
                    <View style={styles.successIconContainer}>
                        <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
                    </View>
                    <Text style={styles.successTitle}>Thank You!</Text>
                    <Text style={styles.successMessage}>
                        Your feedback helps us improve ConnectO.
                    </Text>
                </View>
            </Animated.View>
        );
    };

    // Render feedback history item
    const renderHistoryItem = ({ item }: { item: Feedback }) => {
        const typeConfig = FEEDBACK_TYPE_CONFIG[item.feedbackType];
        const statusConfig = FEEDBACK_STATUS_CONFIG[item.status];
        const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        return (
            <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                    <View style={[styles.historyTypeIcon, { backgroundColor: typeConfig.color + '15' }]}>
                        <Ionicons name={typeConfig.icon as any} size={18} color={typeConfig.color} />
                    </View>
                    <View style={styles.historyInfo}>
                        <Text style={styles.historyType}>{typeConfig.label}</Text>
                        <Text style={styles.historyDate}>{date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                        <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>
                <Text style={styles.historyMessage} numberOfLines={3}>
                    {item.message}
                </Text>
                {item.rating && (
                    <View style={styles.historyRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name={star <= item.rating! ? 'star' : 'star-outline'}
                                size={14}
                                color={star <= item.rating! ? COLORS.star : COLORS.starEmpty}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feedback & Suggestions</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'submit' && styles.tabActive]}
                    onPress={() => setActiveTab('submit')}
                >
                    <Ionicons
                        name="create-outline"
                        size={18}
                        color={activeTab === 'submit' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'submit' && styles.tabTextActive]}>
                        Submit
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                    onPress={() => setActiveTab('history')}
                >
                    <Ionicons
                        name="time-outline"
                        size={18}
                        color={activeTab === 'history' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                        My Submissions
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Submit Tab */}
            {activeTab === 'submit' && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Rate limit info */}
                        {rateLimitRemaining < 3 && (
                            <View style={styles.rateLimitBanner}>
                                <Ionicons name="information-circle" size={18} color={COLORS.info} />
                                <Text style={styles.rateLimitText}>
                                    {rateLimitRemaining} submission{rateLimitRemaining !== 1 ? 's' : ''} remaining this hour
                                </Text>
                            </View>
                        )}

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Feedback Type */}
                            <FeedbackTypeDropdown
                                value={feedbackType}
                                onChange={setFeedbackType}
                                error={errors.type}
                            />

                            {/* Message */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Your Feedback *</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        errors.message && styles.textAreaError,
                                    ]}
                                    placeholder="Tell us what you need or what went wrong..."
                                    placeholderTextColor={COLORS.textMuted}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    maxLength={VALIDATION.MESSAGE_MAX_LENGTH}
                                    value={message}
                                    onChangeText={setMessage}
                                />
                                <View style={styles.charCount}>
                                    {errors.message && (
                                        <Text style={styles.errorText}>{errors.message}</Text>
                                    )}
                                    <Text style={styles.charCountText}>
                                        {message.length}/{VALIDATION.MESSAGE_MAX_LENGTH}
                                    </Text>
                                </View>
                            </View>

                            {/* Screenshot */}
                            <ScreenshotPicker
                                value={screenshotUri}
                                onChange={setScreenshotUri}
                                disabled={isSubmitting}
                            />

                            {/* Rating */}
                            <View style={styles.ratingSection}>
                                <StarRatingInput
                                    value={rating}
                                    onChange={setRating}
                                />
                            </View>

                            {/* Error message */}
                            {submitError && (
                                <View style={styles.errorBanner}>
                                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                                    <Text style={styles.errorBannerText}>{submitError}</Text>
                                </View>
                            )}

                            {/* Submit Button */}
                            <Button
                                title={isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                disabled={isSubmitting || rateLimitRemaining === 0}
                                fullWidth
                                size="lg"
                                style={styles.submitButton}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <FlatList
                    data={feedbackHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.historyList}
                    ListEmptyComponent={
                        isLoadingHistory ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : (
                            <FeedbackEmptyState />
                        )
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoadingHistory}
                            onRefresh={handleRefreshHistory}
                            tintColor={COLORS.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMoreHistory && feedbackHistory.length > 0 ? (
                            <View style={styles.loadingMore}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Success Overlay */}
            {renderSuccessOverlay()}
        </SafeAreaView>
    );
}

// =============================================
// WRAPPED EXPORT WITH PROVIDER
// =============================================

export default function FeedbackScreen() {
    return (
        <FeedbackProvider>
            <FeedbackScreenContent />
        </FeedbackProvider>
    );
}

// =============================================
// STYLES
// =============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    tabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        marginRight: SPACING.xl,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: SPACING.xs,
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textMuted,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    rateLimitBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.info + '10',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    rateLimitText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.info,
    },
    form: {
        padding: SPACING.base,
    },
    inputGroup: {
        marginBottom: SPACING.base,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    textArea: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        minHeight: 140,
    },
    textAreaError: {
        borderColor: COLORS.error,
    },
    charCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    charCountText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
    },
    ratingSection: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.base,
        ...SHADOWS.sm,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '10',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.base,
        gap: SPACING.sm,
    },
    errorBannerText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
    },
    submitButton: {
        marginTop: SPACING.md,
    },
    historyList: {
        padding: SPACING.base,
        flexGrow: 1,
    },
    historyItem: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    historyTypeIcon: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    historyInfo: {
        flex: 1,
    },
    historyType: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    historyDate: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    statusText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },
    historyMessage: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    historyRating: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
        gap: 2,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['3xl'],
    },
    loadingMore: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
    loginPrompt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    loginIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    loginTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    loginSubtitle: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    loginButton: {
        minWidth: 200,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    successContent: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    successIconContainer: {
        marginBottom: SPACING.md,
    },
    successTitle: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    successMessage: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
