import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface QuickActionsRowProps {
    viewMode: 'list' | 'map';
    onViewModeChange: (mode: 'list' | 'map') => void;
    activeFiltersCount: number;
    onFiltersPress: () => void;
    sortBy: string;
    onSortPress?: () => void;
    showMapToggle: boolean;
}

export default function QuickActionsRow({
    viewMode,
    onViewModeChange,
    activeFiltersCount,
    onFiltersPress,
    sortBy,
    onSortPress,
    showMapToggle,
}: QuickActionsRowProps) {
    return (
        <View style={styles.container}>
            {/* Map/List Toggle */}
            {showMapToggle && (
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
                        onPress={() => onViewModeChange('list')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="list" size={18} color={viewMode === 'list' ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
                        onPress={() => onViewModeChange('map')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="map" size={18} color={viewMode === 'map' ? COLORS.white : COLORS.textSecondary} />
                        <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>Map</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Filter Button */}
            <TouchableOpacity
                style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
                onPress={onFiltersPress}
                activeOpacity={0.7}
            >
                <Ionicons name="options" size={18} color={activeFiltersCount > 0 ? COLORS.white : COLORS.textSecondary} />
                <Text style={[styles.filterButtonText, activeFiltersCount > 0 && styles.filterButtonTextActive]}>
                    Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                </Text>
            </TouchableOpacity>

            {/* Sort Button */}
            {onSortPress && (
                <TouchableOpacity style={styles.sortButton} onPress={onSortPress} activeOpacity={0.7}>
                    <Text style={styles.sortText}>
                        {sortBy.replace('_', ' ')}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: 2,
        ...SHADOWS.sm,
    },
    viewToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
    },
    viewToggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    viewToggleText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    viewToggleTextActive: {
        color: COLORS.white,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.xs,
        ...SHADOWS.sm,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterButtonText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: COLORS.white,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.xs,
        marginLeft: 'auto',
        ...SHADOWS.sm,
    },
    sortText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
});
