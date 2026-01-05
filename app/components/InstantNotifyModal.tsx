/**
 * Instant Notify Modal
 * ====================
 * Confirmation bottom sheet for notifying a worker.
 * Clean, premium design with clear CTA.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface InstantNotifyModalProps {
    visible: boolean;
    workerName: string;
    isLoading: boolean;
    onNotify: () => void;
    onClose: () => void;
}

export default function InstantNotifyModal({
    visible,
    workerName,
    isLoading,
    onNotify,
    onClose,
}: InstantNotifyModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.modalContainer}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications" size={40} color={COLORS.warning} />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Notify Worker?</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        This will send a reminder to <Text style={styles.workerName}>{workerName}</Text> to respond faster.
                    </Text>

                    {/* Info banner */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="time-outline" size={16} color={COLORS.info} />
                        <Text style={styles.infoText}>
                            You can notify again after 5 minutes
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.notifyButton}
                            onPress={onNotify}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name="notifications" size={20} color={COLORS.white} />
                                    <Text style={styles.notifyButtonText}>Notify Now</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS['2xl'],
        borderTopRightRadius: BORDER_RADIUS['2xl'],
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING['2xl'],
        alignItems: 'center',
        ...SHADOWS.lg,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.borderLight,
        borderRadius: 2,
        marginBottom: SPACING.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.warning + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    message: {
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    workerName: {
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.info + '10',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.lg,
        gap: SPACING.xs,
    },
    infoText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.info,
    },
    buttonContainer: {
        width: '100%',
        gap: SPACING.sm,
    },
    notifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.warning,
        paddingVertical: SPACING.md + 2,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
        shadowColor: COLORS.warning,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    notifyButtonText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.white,
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
});
