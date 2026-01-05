/**
 * FeedbackTypeDropdown Component
 * ==============================
 * Styled dropdown for selecting feedback type with icons and descriptions.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { FeedbackType, FEEDBACK_TYPE_CONFIG } from '../../lib/feedbackTypes';

interface FeedbackTypeDropdownProps {
    value: FeedbackType | null;
    onChange: (type: FeedbackType) => void;
    error?: string;
}

const feedbackOptions = Object.values(FeedbackType).map((type) => ({
    type,
    ...FEEDBACK_TYPE_CONFIG[type],
}));

export default function FeedbackTypeDropdown({
    value,
    onChange,
    error,
}: FeedbackTypeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = value ? FEEDBACK_TYPE_CONFIG[value] : null;

    const handleSelect = (type: FeedbackType) => {
        onChange(type);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Feedback Type *</Text>

            <TouchableOpacity
                style={[
                    styles.dropdown,
                    error && styles.dropdownError,
                    isOpen && styles.dropdownActive,
                ]}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                {selectedOption ? (
                    <View style={styles.selectedContent}>
                        <View style={[styles.iconContainer, { backgroundColor: selectedOption.color + '15' }]}>
                            <Ionicons
                                name={selectedOption.icon as any}
                                size={18}
                                color={selectedOption.color}
                            />
                        </View>
                        <Text style={styles.selectedText}>{selectedOption.label}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholder}>Select feedback type...</Text>
                )}
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textMuted}
                />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Dropdown Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Feedback Type</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={feedbackOptions}
                            keyExtractor={(item) => item.type}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        value === item.type && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelect(item.type)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.optionIcon, { backgroundColor: item.color + '15' }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionLabel}>{item.label}</Text>
                                        <Text style={styles.optionDescription}>{item.description}</Text>
                                    </View>
                                    {value === item.type && (
                                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </Pressable>
            </Modal>
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
        marginBottom: SPACING.xs,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        minHeight: 52,
    },
    dropdownError: {
        borderColor: COLORS.error,
    },
    dropdownActive: {
        borderColor: COLORS.primary,
    },
    selectedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    selectedText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    placeholder: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textMuted,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        marginTop: SPACING.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        maxHeight: '70%',
        ...SHADOWS.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },
    optionSelected: {
        backgroundColor: COLORS.primary + '08',
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textMuted,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginHorizontal: SPACING.base,
    },
});
