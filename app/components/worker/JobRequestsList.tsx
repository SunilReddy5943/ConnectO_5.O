import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import JobRequestCard, { JobRequest } from './JobRequestCard';

interface JobRequestsListProps {
    requests: JobRequest[];
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onCall: (requestId: string) => void;
    onMessage: (requestId: string) => void;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export default function JobRequestsList({
    requests,
    onAccept,
    onReject,
    onCall,
    onMessage,
    refreshing = false,
    onRefresh,
}: JobRequestsListProps) {
    // Check if request is new (within last 5 minutes)
    const isNewRequest = (timestamp: string) => {
        const requestTime = new Date(timestamp).getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        return now - requestTime < fiveMinutes;
    };

    if (requests.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="briefcase-outline" size={64} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Active Requests</Text>
                <Text style={styles.emptySubtitle}>
                    New job requests will appear here. Make sure you're online to receive requests!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="notifications" size={20} color={COLORS.primary} />
                    <Text style={styles.title}>Job Requests</Text>
                    {requests.length > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{requests.length}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.subtitle}>Respond quickly to increase your hire rate</Text>
            </View>

            {/* Requests List */}
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <JobRequestCard
                        request={item}
                        onAccept={onAccept}
                        onReject={onReject}
                        onCall={onCall}
                        onMessage={onMessage}
                        isNew={isNewRequest(item.timestamp)}
                    />
                )}
                scrollEnabled={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.base,
    },
    header: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    countBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 24,
        alignItems: 'center',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl * 2,
        paddingHorizontal: SPACING.base,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.base,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
