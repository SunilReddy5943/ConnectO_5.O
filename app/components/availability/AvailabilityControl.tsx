/**
 * Availability Control
 * ====================
 * Worker-side control panel for managing availability status.
 * Includes manual status selector and auto-mode toggle.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
    AvailabilityStatus,
    STATUS_CONFIG,
    BUSY_DURATION_PRESETS,
    getStatusConfig,
} from '../../lib/availabilityTypes';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import AvailabilityStatusBadge from './AvailabilityStatusBadge';

interface AvailabilityControlProps {
    currentStatus: AvailabilityStatus;
    autoModeEnabled: boolean;
    busyUntil?: Date;
    onStatusChange: (status: AvailabilityStatus) => void;
    onAutoModeToggle: (enabled: boolean) => void;
    onSetBusyDuration: (minutes: number | null, reason?: string) => void;
}

export default function AvailabilityControl({
    currentStatus,
    autoModeEnabled,
    busyUntil,
    onStatusChange,
    onAutoModeToggle,
    onSetBusyDuration,
}: AvailabilityControlProps) {
    const [showBusyModal, setShowBusyModal] = useState(false);

    const handleStatusPress = (status: AvailabilityStatus) => {
        if (status === 'BUSY') {
            setShowBusyModal(true);
        } else {
            onStatusChange(status);
        }
    };

    const handleBusyDurationSelect = (minutes: number | null) => {
        onSetBusyDuration(minutes);
        setShowBusyModal(false);
        onStatusChange('BUSY');
    };

    const statuses: AvailabilityStatus[] = ['ONLINE', 'BUSY', 'OFFLINE'];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="pulse" size={20} color={COLORS.secondary} />
                    <Text style={styles.title}>Availability</Text>
                </View>
                <View style={styles.autoModeRow}>
                    <Text style={styles.autoModeLabel}>Auto Mode</Text>
                    <Switch
                        value={autoModeEnabled}
                        onValueChange={onAutoModeToggle}
                        trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                        thumbColor={autoModeEnabled ? COLORS.primary : COLORS.textMuted}
                    />
                </View>
            </View>

            {/* Current Status Display */}
            <View style={styles.currentStatusContainer}>
                <AvailabilityStatusBadge status={currentStatus} variant="full" showIcon showLabel />
                {autoModeEnabled && (
                    <View style={styles.autoModeBadge}>
                        <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                        <Text style={styles.autoModeText}>Auto</Text>
                    </View>
                )}
            </View>

            {/* Status Selector */}
            {!autoModeEnabled && (
                <View style={styles.statusSelector}>
                    {statuses.map((status) => {
                        const config = getStatusConfig(status);
                        const isActive = currentStatus === status;

                        return (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    isActive && [styles.statusButtonActive, { borderColor: config.color, backgroundColor: config.bgColor }],
                                ]}
                                onPress={() => handleStatusPress(status)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={config.icon}
                                    size={20}
                                    color={isActive ? config.color : COLORS.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.statusButtonText,
                                        isActive && [styles.statusButtonTextActive, { color: config.color }],
                                    ]}
                                >
                                    {config.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Busy Duration Modal */}
            <Modal
                visible={showBusyModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowBusyModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalBackdrop} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>How long will you be busy?</Text>
                            <TouchableOpacity onPress={() => setShowBusyModal(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.durationList}>
                            {BUSY_DURATION_PRESETS.map((preset, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.durationOption}
                                    onPress={() => handleBusyDurationSelect(preset.minutes)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                                    <Text style={styles.durationOptionText}>{preset.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
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
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.base,
        marginHorizontal: SPACING.base,
        marginTop: SPACING.md,
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
        gap: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    autoModeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    autoModeLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    currentStatusContainer: {
        marginBottom: SPACING.md,
    },
    autoModeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.full,
        marginTop: SPACING.sm,
    },
    autoModeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary,
    },
    statusSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    statusButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    statusButtonActive: {
        borderWidth: 2,
        ...SHADOWS.sm,
    },
    statusButtonText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.textMuted,
    },
    statusButtonTextActive: {
        fontWeight: '700',
    },

    // Modal styles
    modalContainer: {
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
        paddingTop: SPACING.md,
        paddingBottom: SPACING['2xl'],
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    modalClose: {
        padding: SPACING.xs,
    },
    durationList: {
        paddingHorizontal: SPACING.lg,
    },
    durationOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    durationOptionText: {
        flex: 1,
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
});
