import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface WorkerPerformanceSummaryProps {
    responseRate: number;
    acceptanceRate: number;
    averageRating: number;
    onViewAnalytics: () => void;
}

export default function WorkerPerformanceSummary({
    responseRate,
    acceptanceRate,
    averageRating,
    onViewAnalytics,
}: WorkerPerformanceSummaryProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
                    <Text style={styles.title}>Performance</Text>
                </View>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
                {/* Response Rate */}
                <View style={styles.metricCard}>
                    <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
                        <Ionicons name="flash" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.metricValue}>{responseRate}%</Text>
                    <Text style={styles.metricLabel}>Response Rate</Text>
                </View>

                {/* Acceptance Rate */}
                <View style={styles.metricCard}>
                    <View style={[styles.iconCircle, { backgroundColor: COLORS.successLight }]}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    </View>
                    <Text style={styles.metricValue}>{acceptanceRate}%</Text>
                    <Text style={styles.metricLabel}>Acceptance</Text>
                </View>

                {/* Average Rating */}
                <View style={styles.metricCard}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="star" size={20} color={COLORS.star} />
                    </View>
                    <Text style={styles.metricValue}>{averageRating.toFixed(1)}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                </View>
            </View>

            {/* View Analytics Button */}
            <TouchableOpacity
                style={styles.analyticsButton}
                onPress={onViewAnalytics}
                activeOpacity={0.8}
            >
                <Ionicons name="analytics" size={18} color={COLORS.primary} />
                <Text style={styles.analyticsText}>View Full Analytics</Text>
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
        marginBottom: SPACING.xl,
        padding: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.md,
    },
    header: {
        marginBottom: SPACING.base,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.base,
    },
    metricCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    metricLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    analyticsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.base,
    },
    analyticsText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
});
