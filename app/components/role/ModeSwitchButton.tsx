/**
 * Mode Switch Button
 * ===================
 * Premium FAB/pill button for role switching.
 * Serves as the entry point for mode transition.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface ModeSwitchButtonProps {
    variant?: 'fab' | 'pill' | 'compact';
    position?: 'bottom-center' | 'inline';
    onPress: () => void;
}

export default function ModeSwitchButton({
    variant = 'pill',
    position = 'inline',
    onPress,
}: ModeSwitchButtonProps) {
    const { user, activeRole, hasRole } = useAuth();

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Only show for users with both roles
    const canSwitchRoles = hasRole('CUSTOMER') && hasRole('WORKER');

    if (!canSwitchRoles) {
        return null;
    }

    const targetRole = activeRole === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER';
    const buttonLabel = activeRole === 'CUSTOMER' ? 'Switch to Worker' : 'Switch to Customer';
    const iconName = activeRole === 'CUSTOMER' ? 'briefcase' : 'person';

    // Pulse animation for FAB
    useEffect(() => {
        if (variant === 'fab') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [variant]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
                tension: 100,
                friction: 3,
            }),
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 3,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const glowColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: activeRole === 'CUSTOMER'
            ? ['rgba(249, 115, 22, 0)', 'rgba(249, 115, 22, 0.3)']
            : ['rgba(30, 64, 175, 0)', 'rgba(30, 64, 175, 0.3)'],
    });

    // FAB variant
    if (variant === 'fab') {
        return (
            <View style={[styles.fabContainer, position === 'bottom-center' && styles.fabBottomCenter]}>
                <Animated.View
                    style={[
                        styles.fabGlow,
                        {
                            backgroundColor: glowColor,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                />
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.9}
                        style={styles.fab}
                    >
                        <LinearGradient
                            colors={
                                activeRole === 'CUSTOMER'
                                    ? ['#F97316', '#EA580C']
                                    : ['#3B82F6', '#1E40AF']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.fabGradient}
                        >
                            <Ionicons name={iconName} size={24} color={COLORS.white} />
                            <Text style={styles.fabLabel}>{targetRole}</Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    // Pill variant
    if (variant === 'pill') {
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    style={styles.pillContainer}
                >
                    <Animated.View
                        style={[
                            styles.pillGlow,
                            { backgroundColor: glowColor },
                        ]}
                    />
                    <BlurView intensity={20} tint="light" style={styles.pillBlur}>
                        <LinearGradient
                            colors={
                                activeRole === 'CUSTOMER'
                                    ? ['rgba(249, 115, 22, 0.1)', 'rgba(234, 88, 12, 0.15)']
                                    : ['rgba(59, 130, 246, 0.1)', 'rgba(30, 64, 175, 0.15)']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.pillGradient}
                        >
                            <View style={styles.pillIconContainer}>
                                <Ionicons
                                    name={iconName}
                                    size={20}
                                    color={activeRole === 'CUSTOMER' ? COLORS.secondary : COLORS.primary}
                                />
                            </View>
                            <View style={styles.pillContent}>
                                <Text style={styles.pillLabel}>{buttonLabel}</Text>
                                <Text style={styles.pillSubtitle}>
                                    {activeRole === 'CUSTOMER' ? 'Find work opportunities' : 'Hire skilled workers'}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={activeRole === 'CUSTOMER' ? COLORS.secondary : COLORS.primary}
                            />
                        </LinearGradient>
                    </BlurView>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // Compact variant
    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={styles.compactContainer}
            >
                <LinearGradient
                    colors={
                        activeRole === 'CUSTOMER'
                            ? ['#F97316', '#EA580C']
                            : ['#3B82F6', '#1E40AF']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.compactGradient}
                >
                    <Ionicons name={iconName} size={18} color={COLORS.white} />
                    <Text style={styles.compactLabel}>{buttonLabel}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // FAB styles
    fabContainer: {
        position: 'absolute',
    },
    fabBottomCenter: {
        bottom: SPACING['2xl'],
        alignSelf: 'center',
        zIndex: 1000,
    },
    fabGlow: {
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        borderRadius: BORDER_RADIUS.full,
    },
    fab: {
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        ...SHADOWS.lg,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    fabLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '700',
        color: COLORS.white,
    },

    // Pill styles
    pillContainer: {
        position: 'relative',
        marginVertical: SPACING.sm,
    },
    pillGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: BORDER_RADIUS.xl,
    },
    pillBlur: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    pillGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    pillIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    pillContent: {
        flex: 1,
    },
    pillLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    pillSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // Compact styles
    compactContainer: {
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    compactGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
    },
    compactLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.white,
    },
});
