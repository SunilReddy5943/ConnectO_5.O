import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface WorkerHeaderProps {
    worker: {
        id: string;
        name: string;
        profile_photo_url?: string;
    } | null;
    isAvailable: boolean;
    onToggleAvailability: () => void;
    unreadNotifications: number;
    onProfilePress: () => void;
    onNotificationsPress: () => void;
}

export default function WorkerHeader({
    worker,
    isAvailable,
    onToggleAvailability,
    unreadNotifications,
    onProfilePress,
    onNotificationsPress,
}: WorkerHeaderProps) {
    const toggleAnim = useRef(new Animated.Value(isAvailable ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(toggleAnim, {
            toValue: isAvailable ? 1 : 0,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
        }).start();
    }, [isAvailable]);

    const toggleColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.textMuted, COLORS.success],
    });

    const toggleTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
    });

    return (
        <View style={styles.container}>
            {/* Profile Section */}
            <TouchableOpacity style={styles.profileSection} onPress={onProfilePress} activeOpacity={0.7}>
                {worker?.profile_photo_url ? (
                    <Image source={{ uri: worker.profile_photo_url }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={24} color={COLORS.white} />
                    </View>
                )}
                <View style={styles.profileInfo}>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name} numberOfLines={1}>{worker?.name || 'Worker'}</Text>
                </View>
            </TouchableOpacity>

            {/* Right Section */}
            <View style={styles.rightSection}>
                {/* Availability Toggle */}
                <TouchableOpacity
                    style={styles.availabilityContainer}
                    onPress={onToggleAvailability}
                    activeOpacity={0.8}
                >
                    <Animated.View style={[styles.toggleTrack, { backgroundColor: toggleColor }]}>
                        <Animated.View
                            style={[
                                styles.toggleThumb,
                                { transform: [{ translateX: toggleTranslate }] }
                            ]}
                        />
                    </Animated.View>
                    <Text style={[styles.statusText, isAvailable && styles.statusTextActive]}>
                        {isAvailable ? 'Online' : 'Offline'}
                    </Text>
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={onNotificationsPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
                    {unreadNotifications > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: SPACING.sm,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    greeting: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    availabilityContainer: {
        alignItems: 'center',
        marginRight: SPACING.xs,
    },
    toggleTrack: {
        width: 48,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statusTextActive: {
        color: COLORS.success,
    },
    notificationButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
});
