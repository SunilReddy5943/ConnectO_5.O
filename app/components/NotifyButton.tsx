/**
 * Notify Button Component
 * =======================
 * Animated button for instant worker notification.
 * States: ready (pulse), loading, notified (check), cooldown (timer)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NotifyStatus, NOTIFY_CONFIG } from '../lib/workerNotifyTypes';

interface NotifyButtonProps {
    status: NotifyStatus;
    cooldownSeconds?: number;
    onPress: () => void;
    compact?: boolean;
}

export default function NotifyButton({
    status,
    cooldownSeconds = 0,
    onPress,
    compact = false,
}: NotifyButtonProps) {
    // Pulse animation for ready state
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [displaySeconds, setDisplaySeconds] = useState(cooldownSeconds);

    // Pulse animation
    useEffect(() => {
        if (status === NotifyStatus.READY) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [status]);

    // Cooldown timer
    useEffect(() => {
        setDisplaySeconds(cooldownSeconds);

        if (status === NotifyStatus.COOLDOWN && cooldownSeconds > 0) {
            const interval = setInterval(() => {
                setDisplaySeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, cooldownSeconds]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getButtonConfig = () => {
        switch (status) {
            case NotifyStatus.READY:
                return {
                    icon: 'notifications-outline' as const,
                    label: compact ? '' : 'Notify',
                    bgColor: COLORS.warning + '15',
                    iconColor: COLORS.warning,
                    textColor: COLORS.warning,
                    disabled: false,
                };
            case NotifyStatus.NOTIFYING:
                return {
                    icon: null,
                    label: '',
                    bgColor: COLORS.warning + '15',
                    iconColor: COLORS.warning,
                    textColor: COLORS.warning,
                    disabled: true,
                };
            case NotifyStatus.NOTIFIED:
                return {
                    icon: 'checkmark-circle' as const,
                    label: compact ? '' : 'Notified',
                    bgColor: COLORS.success + '15',
                    iconColor: COLORS.success,
                    textColor: COLORS.success,
                    disabled: true,
                };
            case NotifyStatus.COOLDOWN:
                return {
                    icon: 'time-outline' as const,
                    label: formatTime(displaySeconds),
                    bgColor: COLORS.textMuted + '15',
                    iconColor: COLORS.textMuted,
                    textColor: COLORS.textMuted,
                    disabled: true,
                };
        }
    };

    const config = getButtonConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: pulseAnim }] },
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.button,
                    compact && styles.buttonCompact,
                    { backgroundColor: config.bgColor },
                    config.disabled && styles.buttonDisabled,
                ]}
                onPress={onPress}
                disabled={config.disabled}
                activeOpacity={0.7}
            >
                {status === NotifyStatus.NOTIFYING ? (
                    <ActivityIndicator size="small" color={config.iconColor} />
                ) : (
                    <>
                        {config.icon && (
                            <Ionicons name={config.icon} size={compact ? 18 : 16} color={config.iconColor} />
                        )}
                        {config.label && !compact && (
                            <Text style={[styles.label, { color: config.textColor }]}>
                                {config.label}
                            </Text>
                        )}
                        {status === NotifyStatus.COOLDOWN && compact && (
                            <Text style={[styles.compactTime, { color: config.textColor }]}>
                                {formatTime(displaySeconds)}
                            </Text>
                        )}
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Wrapper for animation
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.xs,
        minWidth: 80,
    },
    buttonCompact: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        minWidth: 40,
    },
    buttonDisabled: {
        opacity: 0.85,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    compactTime: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        marginLeft: 2,
    },
});
