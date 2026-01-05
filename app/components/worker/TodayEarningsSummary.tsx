import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface TodayEarningsSummaryProps {
    todayEarnings: number;
    jobsCompletedToday: number;
    pendingPayouts?: number;
    onViewDetails: () => void;
}

export default function TodayEarningsSummary({
    todayEarnings,
    jobsCompletedToday,
    pendingPayouts = 0,
    onViewDetails,
}: TodayEarningsSummaryProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="wallet" size={20} color={COLORS.success} />
                    <Text style={styles.title}>Today's Earnings</Text>
                </View>
                <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Earnings */}
            <View style={styles.mainEarnings}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.amount}>{todayEarnings.toLocaleString()}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{jobsCompletedToday}</Text>
                        <Text style={styles.statLabel}>Jobs Done</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                        <Ionicons name="time" size={18} color={COLORS.warning} />
                    </View>
                    <View>
                        <Text style={styles.statValue}>₹{pendingPayouts.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity
                style={styles.detailsButton}
                onPress={onViewDetails}
                activeOpacity={0.8}
            >
                <Text style={styles.detailsText}>View Full Analytics</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
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
        ...SHADOWS.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    mainEarnings: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: SPACING.md,
    },
    currency: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.success,
        marginRight: 4,
    },
    amount: {
        fontSize: 40,
        fontWeight: '800',
        color: COLORS.success,
        letterSpacing: -1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.sm,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.primaryLight,
        borderRadius: BORDER_RADIUS.md,
    },
    detailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
});
