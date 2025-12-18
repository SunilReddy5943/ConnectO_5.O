import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface TrustInsightsCardProps {
  verified: boolean;
  completionRate: number;
  averageRating: number;
}

export default function TrustInsightsCard({ 
  verified, 
  completionRate, 
  averageRating 
}: TrustInsightsCardProps) {
  const insights = [
    {
      icon: 'shield-checkmark',
      label: 'Verified status',
      value: verified ? '✓ Verified' : 'Pending',
      color: verified ? COLORS.success : COLORS.warning,
    },
    {
      icon: 'checkmark-done-circle',
      label: 'Completion rate',
      value: `${Math.round(completionRate)}%`,
      color: completionRate >= 90 ? COLORS.success : COLORS.verified,
    },
    {
      icon: 'star',
      label: 'Average rating',
      value: `${averageRating.toFixed(1)} ⭐`,
      color: averageRating >= 4.5 ? COLORS.success : COLORS.star,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="thumbs-up" size={20} color={COLORS.verified} />
        <Text style={styles.title}>Why customers trust you</Text>
      </View>

      <View style={styles.insights}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Ionicons name={insight.icon as any} size={18} color={insight.color} />
            </View>
            <View style={styles.insightInfo}>
              <Text style={styles.insightLabel}>{insight.label}</Text>
              <Text style={[styles.insightValue, { color: insight.color }]}>
                {insight.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  insights: {
    gap: SPACING.md,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightInfo: {
    flex: 1,
  },
  insightLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
});
