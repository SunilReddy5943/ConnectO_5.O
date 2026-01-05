import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface ActiveJobCardProps {
    jobTitle: string;
    customerName: string;
    customerPhone?: string;
    startTime: Date;
    status: 'on_way' | 'arrived' | 'in_progress' | 'completing';
    onUpdateStatus?: () => void;
    onCall?: () => void;
    onMessage?: () => void;
}

export default function ActiveJobCard({
    jobTitle,
    customerName,
    customerPhone,
    startTime,
    status,
    onUpdateStatus,
    onCall,
    onMessage,
}: ActiveJobCardProps) {
    const [elapsedTime, setElapsedTime] = useState('');
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulse animation for active status
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Timer for elapsed time
        const updateTime = () => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const hours = Math.floor(diff / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            if (hours > 0) {
                setElapsedTime(`${hours}h ${mins}m`);
            } else {
                setElapsedTime(`${mins} min`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [startTime]);

    const getStatusInfo = () => {
        switch (status) {
            case 'on_way':
                return { label: 'On the way', color: COLORS.info, icon: 'navigate' as const };
            case 'arrived':
                return { label: 'Arrived', color: COLORS.warning, icon: 'location' as const };
            case 'in_progress':
                return { label: 'In Progress', color: COLORS.primary, icon: 'construct' as const };
            case 'completing':
                return { label: 'Completing', color: COLORS.success, icon: 'checkmark-circle' as const };
            default:
                return { label: 'Active', color: COLORS.primary, icon: 'time' as const };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.statusRow}>
                    <Animated.View style={[styles.statusDot, { backgroundColor: statusInfo.color, transform: [{ scale: pulseAnim }] }]} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
                <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.timerText}>{elapsedTime}</Text>
                </View>
            </View>

            <Text style={styles.jobTitle}>{jobTitle}</Text>
            <Text style={styles.customerName}>{customerName}</Text>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onUpdateStatus} activeOpacity={0.7}>
                    <Ionicons name={statusInfo.icon} size={18} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Update Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onCall} activeOpacity={0.7}>
                    <Ionicons name="call" size={20} color={COLORS.success} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onMessage} activeOpacity={0.7}>
                    <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.base,
        marginTop: SPACING.base,
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        ...SHADOWS.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.xs,
    },
    statusText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    timerText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    jobTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    customerName: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
    },
    actionButtonText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.white,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
