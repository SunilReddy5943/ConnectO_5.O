/**
 * Availability Status Badge
 * ==========================
 * Visual indicator for worker availability status.
 * Shows on worker cards with real-time updates.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    AvailabilityStatus,
    STATUS_CONFIG,
    getStatusConfig,
} from '../../lib/availabilityTypes';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface AvailabilityStatusBadgeProps {
    status: AvailabilityStatus;
    variant?: 'compact' | 'full';
    showLabel?: boolean;
    showIcon?: boolean;
    customerView?: boolean;
}

export default function AvailabilityStatusBadge({
    status,
    variant = 'compact',
    showLabel = true,
    showIcon = true,
    customerView = false,
}: AvailabilityStatusBadgeProps) {
    const config = getStatusConfig(status);
    const label = customerView ? config.customerLabel : config.label;

    if (variant === 'compact') {
        return (
            <View style={[styles.compactBadge, { backgroundColor: config.bgColor }]}>
                {showIcon && (
                    <Ionicons name={config.icon} size={12} color={config.color} />
                )}
                {showLabel && (
                    <Text style={[styles.compactLabel, { color: config.color }]}>
                        {label}
                    </Text>
                )}
            </View>
        );
    }

    // Full variant
    return (
        <View style={[styles.fullBadge, { backgroundColor: config.bgColor, borderColor: config.color }]}>
            {showIcon && (
                <View style={[styles.iconContainer, { backgroundColor: config.color + '30' }]}>
                    <Ionicons name={config.icon} size={16} color={config.color} />
                </View>
            )}
            <View style={styles.textContainer}>
                <Text style={[styles.fullLabel, { color: config.color }]}>{label}</Text>
                {!customerView && (
                    <Text style={styles.description}>{config.description}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Compact variant
    compactBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs / 2,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.full,
    },
    compactLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },

    // Full variant
    fullBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    fullLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    description: {
        fontSize: FONT_SIZES.sm,
        color: '#64748B',
        marginTop: 2,
    },
});
