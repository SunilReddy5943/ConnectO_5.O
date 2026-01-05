/**
 * StarRatingInput Component
 * =========================
 * Interactive 5-star rating component with touch feedback.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface StarRatingInputProps {
    value: number | null;
    onChange: (rating: number) => void;
    label?: string;
    size?: number;
}

export default function StarRatingInput({
    value,
    onChange,
    label = 'How satisfied are you with ConnectO?',
    size = 36,
}: StarRatingInputProps) {
    const stars = [1, 2, 3, 4, 5];

    const getRatingLabel = (rating: number | null): string => {
        if (rating === null) return 'Tap to rate';
        switch (rating) {
            case 1: return 'Very Dissatisfied';
            case 2: return 'Dissatisfied';
            case 3: return 'Neutral';
            case 4: return 'Satisfied';
            case 5: return 'Very Satisfied';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.starsContainer}>
                {stars.map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={styles.starButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={value !== null && star <= value ? 'star' : 'star-outline'}
                            size={size}
                            color={value !== null && star <= value ? COLORS.star : COLORS.starEmpty}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[
                styles.ratingLabel,
                value !== null && styles.ratingLabelActive,
            ]}>
                {getRatingLabel(value)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    starButton: {
        padding: SPACING.xs,
    },
    ratingLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },
    ratingLabelActive: {
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});
