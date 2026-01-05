import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface QuickAction {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    route: string;
    badge?: number;
}

interface QuickActionsGridProps {
    onActionPress?: (actionId: string) => void;
}

export default function QuickActionsGrid({ onActionPress }: QuickActionsGridProps) {
    const router = useRouter();

    const actions: QuickAction[] = [
        {
            id: 'wallet',
            icon: 'wallet',
            label: 'My Wallet',
            color: COLORS.success,
            route: '/earnings',
        },
        {
            id: 'reviews',
            icon: 'star',
            label: 'My Reviews',
            color: COLORS.warning,
            route: '/reviews',
        },
        {
            id: 'schedule',
            icon: 'calendar',
            label: 'Schedule',
            color: COLORS.primary,
            route: '/schedule',
        },
        {
            id: 'support',
            icon: 'headset',
            label: 'Support',
            color: COLORS.info,
            route: '/support',
        },
    ];

    const handlePress = (action: QuickAction) => {
        if (onActionPress) {
            onActionPress(action.id);
        }
        router.push(action.route as any);
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionButton}
                        onPress={() => handlePress(action)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                            <Ionicons name={action.icon} size={24} color={action.color} />
                            {action.badge && action.badge > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{action.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.label}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.base,
        marginTop: SPACING.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '23%',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.error,
        borderRadius: BORDER_RADIUS.full,
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
    label: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
});
