/**
 * FeedbackEmptyState Component
 * ============================
 * Empty state displayed when user has no feedback history.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface FeedbackEmptyStateProps {
    onSubmitPress?: () => void;
}

export default function FeedbackEmptyState({ onSubmitPress }: FeedbackEmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textMuted} />
            </View>
            <Text style={styles.title}>No Feedback Yet</Text>
            <Text style={styles.subtitle}>
                Your submitted feedback and suggestions will appear here.
                Help us make ConnectO better!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING['2xl'],
        paddingVertical: SPACING['3xl'],
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
});
