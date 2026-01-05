/**
 * Skill Selector
 * ==============
 * Multi-select skill chips picker.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { SKILLS, SUB_SKILLS } from '../../lib/profileTypes';

interface SkillSelectorProps {
    primarySkill: string;
    subSkills: string[];
    onPrimaryChange: (skill: string) => void;
    onSubSkillsChange: (skills: string[]) => void;
    disabled?: boolean;
}

export default function SkillSelector({
    primarySkill,
    subSkills,
    onPrimaryChange,
    onSubSkillsChange,
    disabled = false,
}: SkillSelectorProps) {
    const [showPrimaryModal, setShowPrimaryModal] = useState(false);

    const availableSubSkills = SUB_SKILLS[primarySkill] || [];

    const toggleSubSkill = (skill: string) => {
        if (disabled) return;

        if (subSkills.includes(skill)) {
            onSubSkillsChange(subSkills.filter(s => s !== skill));
        } else {
            onSubSkillsChange([...subSkills, skill]);
        }
    };

    return (
        <View style={styles.container}>
            {/* Primary Skill */}
            <Text style={styles.label}>Primary Skill</Text>
            <TouchableOpacity
                style={[styles.selector, disabled && styles.selectorDisabled]}
                onPress={() => !disabled && setShowPrimaryModal(true)}
                disabled={disabled}
            >
                <Text style={[styles.selectorText, !primarySkill && styles.placeholderText]}>
                    {primarySkill || 'Select primary skill'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Sub Skills */}
            {availableSubSkills.length > 0 && (
                <View style={styles.subSkillsSection}>
                    <Text style={styles.label}>Sub Skills</Text>
                    <View style={styles.chipsContainer}>
                        {availableSubSkills.map(skill => {
                            const isSelected = subSkills.includes(skill);
                            return (
                                <TouchableOpacity
                                    key={skill}
                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                    onPress={() => toggleSubSkill(skill)}
                                    disabled={disabled}
                                >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                        {skill}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Primary Skill Modal */}
            <Modal
                visible={showPrimaryModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPrimaryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setShowPrimaryModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Primary Skill</Text>
                            <TouchableOpacity onPress={() => setShowPrimaryModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.skillsList}>
                            {SKILLS.map(skill => (
                                <TouchableOpacity
                                    key={skill}
                                    style={[
                                        styles.skillOption,
                                        skill === primarySkill && styles.skillOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onPrimaryChange(skill);
                                        onSubSkillsChange([]); // Reset sub-skills when primary changes
                                        setShowPrimaryModal(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.skillOptionText,
                                            skill === primarySkill && styles.skillOptionTextSelected,
                                        ]}
                                    >
                                        {skill}
                                    </Text>
                                    {skill === primarySkill && (
                                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    selectorDisabled: {
        backgroundColor: COLORS.borderLight,
    },
    selectorText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    placeholderText: {
        color: COLORS.textMuted,
    },
    subSkillsSection: {
        marginTop: SPACING.md,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.borderLight,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipSelected: {
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    chipTextSelected: {
        color: COLORS.primary,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    skillsList: {
        paddingHorizontal: SPACING.lg,
    },
    skillOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    skillOptionSelected: {
        backgroundColor: COLORS.primary + '08',
    },
    skillOptionText: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    skillOptionTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
