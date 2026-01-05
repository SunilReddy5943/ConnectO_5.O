import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, CATEGORIES } from '../../constants/theme';

interface CategorySuggestionsProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    layout?: 'horizontal' | 'grid';
    limit?: number;
}

export default function CategorySuggestions({
    selectedCategory,
    onSelectCategory,
    layout = 'horizontal',
    limit = 8,
}: CategorySuggestionsProps) {
    const categories = CATEGORIES.slice(0, limit);

    const handleCategoryPress = (categoryName: string) => {
        onSelectCategory(selectedCategory === categoryName ? '' : categoryName);
    };

    if (layout === 'grid') {
        // 2-row grid layout
        return (
            <View style={styles.gridContainer}>
                <View style={styles.gridRow}>
                    {categories.slice(0, 4).map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.gridChip, selectedCategory === cat.name && styles.gridChipActive]}
                            onPress={() => handleCategoryPress(cat.name)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color={selectedCategory === cat.name ? COLORS.white : cat.color}
                            />
                            <Text style={[styles.gridChipText, selectedCategory === cat.name && styles.gridChipTextActive]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {categories.length > 4 && (
                    <View style={styles.gridRow}>
                        {categories.slice(4, 8).map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.gridChip, selectedCategory === cat.name && styles.gridChipActive]}
                                onPress={() => handleCategoryPress(cat.name)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={16}
                                    color={selectedCategory === cat.name ? COLORS.white : cat.color}
                                />
                                <Text style={[styles.gridChipText, selectedCategory === cat.name && styles.gridChipTextActive]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // Horizontal scroll layout (default)
    return (
        <View style={styles.horizontalContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.chip, selectedCategory === cat.name && styles.chipActive]}
                        onPress={() => handleCategoryPress(cat.name)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={cat.icon as any}
                            size={14}
                            color={selectedCategory === cat.name ? COLORS.white : cat.color}
                        />
                        <Text style={[styles.chipText, selectedCategory === cat.name && styles.chipTextActive]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Horizontal scroll layout
    horizontalContainer: {
        paddingVertical: SPACING.sm,
    },
    scrollContent: {
        paddingHorizontal: SPACING.base,
        gap: SPACING.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        gap: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.white,
    },

    // Grid layout
    gridContainer: {
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    gridChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gridChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    gridChipText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    gridChipTextActive: {
        color: COLORS.white,
    },
});
