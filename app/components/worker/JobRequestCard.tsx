import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export interface JobRequest {
    id: string;
    customerName: string;
    customerPhoto?: string;
    serviceType: string;
    distance: number;
    estimatedEarnings: number;
    location: string;
    description: string;
    timestamp: string;
}

interface JobRequestCardProps {
    request: JobRequest;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onCall: (requestId: string) => void;
    onMessage: (requestId: string) => void;
    isNew?: boolean;
}

export default function JobRequestCard({
    request,
    onAccept,
    onReject,
    onCall,
    onMessage,
    isNew = false,
}: JobRequestCardProps) {
    const slideAnim = useRef(new Animated.Value(isNew ? 50 : 0)).current;
    const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isNew) {
            // Entry animation
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.03,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isNew]);

    return (
        <Animated.View
            style={[
                styles.container,
                isNew && styles.newRequest,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: isNew ? pulseAnim : 1 },
                    ],
                },
            ]}
        >
            {isNew && (
                <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                </View>
            )}

            {/* Customer Info */}
            <View style={styles.header}>
                <View style={styles.customerInfo}>
                    {request.customerPhoto ? (
                        <Image source={{ uri: request.customerPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color={COLORS.white} />
                        </View>
                    )}
                    <View style={styles.customerDetails}>
                        <Text style={styles.customerName}>{request.customerName}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={12} color={COLORS.textMuted} />
                            <Text style={styles.locationText}>{request.location} • {request.distance} km</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.earningsTag}>
                    <Text style={styles.earningsAmount}>₹{request.estimatedEarnings}</Text>
                </View>
            </View>

            {/* Service Details */}
            <View style={styles.serviceSection}>
                <View style={styles.serviceHeader}>
                    <Ionicons name="construct" size={16} color={COLORS.primary} />
                    <Text style={styles.serviceType}>{request.serviceType}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {request.description}
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
                {/* Secondary Actions */}
                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => onCall(request.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="call" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => onMessage(request.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Primary Actions */}
                <View style={styles.primaryActions}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => onReject(request.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => onAccept(request.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark" size={18} color={COLORS.white} />
                        <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.sm,
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    newRequest: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    newBadge: {
        position: 'absolute',
        top: -8,
        right: SPACING.base,
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        ...SHADOWS.sm,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: SPACING.sm,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    earningsTag: {
        backgroundColor: COLORS.successLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
    },
    earningsAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.success,
    },
    serviceSection: {
        backgroundColor: COLORS.background,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: 4,
    },
    serviceType: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    secondaryButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryActions: {
        flexDirection: 'row',
        gap: SPACING.xs,
        flex: 1,
        justifyContent: 'flex-end',
    },
    rejectButton: {
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.error,
        backgroundColor: COLORS.white,
    },
    rejectText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.error,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.success,
        ...SHADOWS.sm,
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
});
