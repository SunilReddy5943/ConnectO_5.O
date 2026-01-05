/**
 * Section Header
 * ==============
 * Section divider with title for profile forms.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface SectionHeaderProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    subtitle?: string;
}

export default function SectionHeader({ title, icon, subtitle }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon} size={18} color={COLORS.primary} />
                    </View>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
        marginLeft: 36,
    },
});
