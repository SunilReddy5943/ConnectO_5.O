/**
 * Role Switch Modal
 * ==================
 * Confirmation bottom sheet for mode switching.
 * Ensures deliberate role transitions.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoleSwitchModalProps {
    visible: boolean;
    currentRole: 'CUSTOMER' | 'WORKER';
    targetRole: 'CUSTOMER' | 'WORKER';
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function RoleSwitchModal({
    visible,
    currentRole,
    targetRole,
    isLoading = false,
    onConfirm,
    onCancel,
}: RoleSwitchModalProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide up and fade in backdrop
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Slide down and fade out backdrop
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getRoleConfig = () => {
        if (targetRole === 'WORKER') {
            return {
                icon: 'construct',
                iconColor: COLORS.secondary,
                title: 'Switch to Worker Mode?',
                description: "You'll now receive job requests and manage your services.",
                benefits: [
                    'Receive job notifications',
                    'Manage your availability',
                    'Track earnings',
                ],
                gradientColors: ['rgba(249, 115, 22, 0.1)', 'rgba(234, 88, 12, 0.05)'],
                primaryColor: COLORS.secondary,
            };
        } else {
            return {
                icon: 'person',
                iconColor: COLORS.primary,
                title: 'Switch to Customer Mode?',
                description: "You'll browse and hire skilled workers for your needs.",
                benefits: [
                    'Find skilled workers',
                    'Post job requests',
                    'Track your bookings',
                ],
                gradientColors: ['rgba(59, 130, 246, 0.1)', 'rgba(30, 64, 175, 0.05)'],
                primaryColor: COLORS.primary,
            };
        }
    };

    const config = getRoleConfig();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <View style={styles.modalContainer}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onCancel} disabled={isLoading}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: backdropAnim,
                            },
                        ]}
                    />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.sheetContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.sheet}>
                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: config.gradientColors[0] }]}>
                            <Ionicons name={config.icon as any} size={48} color={config.iconColor} />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{config.title}</Text>

                        {/* Description */}
                        <Text style={styles.description}>{config.description}</Text>

                        {/* Benefits */}
                        <View style={styles.benefitsContainer}>
                            {config.benefits.map((benefit, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <View style={[styles.checkIcon, { backgroundColor: config.gradientColors[0] }]}>
                                        <Ionicons name="checkmark" size={16} color={config.primaryColor} />
                                    </View>
                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Stay Here</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={onConfirm}
                                disabled={isLoading}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={
                                        targetRole === 'WORKER'
                                            ? ['#F97316', '#EA580C']
                                            : ['#3B82F6', '#1E40AF']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.confirmGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Text style={styles.confirmButtonText}>Switch Mode</Text>
                                            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetContainer: {
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        overflow: 'hidden',
        ...SHADOWS.lg,
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
        paddingBottom: SPACING['2xl'],
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: BORDER_RADIUS.full,
        alignSelf: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    benefitsContainer: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.xl,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    benefitText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.base,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    confirmButton: {
        flex: 2,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.base,
    },
    confirmButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '700',
        color: COLORS.white,
    },
});
