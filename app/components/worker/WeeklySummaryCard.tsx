import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface WeeklySummaryCardProps {
    weeklyEarnings: number;
    jobsCompleted: number;
    percentChange?: number;
    onViewDetails?: () => void;
}

export default function WeeklySummaryCard({
    weeklyEarnings,
    jobsCompleted,
    percentChange = 0,
    onViewDetails,
}: WeeklySummaryCardProps) {
    const isPositive = percentChange >= 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="trending-up" size={18} color={COLORS.primary} />
                    <Text style={styles.title}>This Week</Text>
                </View>
                {onViewDetails && (
                    <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
                        <Text style={styles.viewLink}>Details →</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>₹{weeklyEarnings.toLocaleString('en-IN')}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={styles.statValue}>{jobsCompleted}</Text>
                    <Text style={styles.statLabel}>Jobs Done</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <View style={[styles.trendBadge, isPositive ? styles.trendPositive : styles.trendNegative]}>
                        <Ionicons
                            name={isPositive ? 'arrow-up' : 'arrow-down'}
                            size={12}
                            color={isPositive ? COLORS.success : COLORS.error}
                        />
                        <Text style={[styles.trendText, isPositive ? styles.trendTextPositive : styles.trendTextNegative]}>
                            {Math.abs(percentChange)}%
                        </Text>
                    </View>
                    <Text style={styles.statLabel}>vs Last Week</Text>
                </View>
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
        ...SHADOWS.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    title: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    viewLink: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.border,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: 2,
    },
    trendPositive: {
        backgroundColor: COLORS.successLight,
    },
    trendNegative: {
        backgroundColor: COLORS.errorLight,
    },
    trendText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        marginLeft: 2,
    },
    trendTextPositive: {
        color: COLORS.success,
    },
    trendTextNegative: {
        color: COLORS.error,
    },
});
