/**
 * Day Selector
 * ============
 * Multi-select days of the week picker.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { DayOfWeek, DAYS_OF_WEEK } from '../../lib/profileTypes';

interface DaySelectorProps {
    selected: DayOfWeek[];
    onChange: (days: DayOfWeek[]) => void;
    label?: string;
    disabled?: boolean;
}

export default function DaySelector({
    selected,
    onChange,
    label,
    disabled = false,
}: DaySelectorProps) {
    const toggleDay = (day: DayOfWeek) => {
        if (disabled) return;

        if (selected.includes(day)) {
            onChange(selected.filter(d => d !== day));
        } else {
            onChange([...selected, day]);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.daysRow}>
                {DAYS_OF_WEEK.map(day => {
                    const isSelected = selected.includes(day.value);
                    return (
                        <TouchableOpacity
                            key={day.value}
                            style={[
                                styles.dayButton,
                                isSelected && styles.dayButtonSelected,
                                disabled && styles.dayButtonDisabled,
                            ]}
                            onPress={() => toggleDay(day.value)}
                            disabled={disabled}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected && styles.dayTextSelected,
                                ]}
                            >
                                {day.short}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.base,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.xs,
    },
    dayButton: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.borderLight,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dayButtonSelected: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    dayButtonDisabled: {
        opacity: 0.5,
    },
    dayText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    dayTextSelected: {
        color: COLORS.primary,
    },
});
