import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface RecentJob {
    id: string;
    title: string;
    earnings: number;
    date: string;
    customerName: string;
}

interface RecentJobsCardProps {
    jobs: RecentJob[];
    onViewAll?: () => void;
    onJobPress?: (jobId: string) => void;
}

export default function RecentJobsCard({ jobs, onViewAll, onJobPress }: RecentJobsCardProps) {
    if (jobs.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="checkmark-done-circle" size={18} color={COLORS.success} />
                    <Text style={styles.title}>Recent Completions</Text>
                </View>
                {onViewAll && (
                    <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
                        <Text style={styles.viewLink}>View All →</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.jobsList}>
                {jobs.slice(0, 3).map((job, index) => (
                    <TouchableOpacity
                        key={job.id}
                        style={[styles.jobItem, index < jobs.length - 1 && styles.jobItemBorder]}
                        onPress={() => onJobPress?.(job.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.jobIcon}>
                            <Ionicons name="checkmark" size={14} color={COLORS.success} />
                        </View>
                        <View style={styles.jobInfo}>
                            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                            <Text style={styles.jobCustomer}>{job.customerName}</Text>
                        </View>
                        <Text style={styles.jobEarnings}>₹{job.earnings.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                ))}
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
    jobsList: {},
    jobItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    jobItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    jobIcon: {
        width: 24,
        height: 24,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.successLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    jobCustomer: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    jobEarnings: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.success,
    },
});
