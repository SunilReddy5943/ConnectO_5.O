import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface GrowthMetricsCardProps {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export default function GrowthMetricsCard({ 
  icon, 
  label, 
  value,
  color = COLORS.primary,
  trend
}: GrowthMetricsCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      
      <Text style={styles.value}>{value.toLocaleString()}</Text>
      <Text style={styles.label}>{label}</Text>
      
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend.direction === 'up' ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={trend.direction === 'up' ? COLORS.success : COLORS.error} 
          />
          <Text style={[
            styles.trendText,
            { color: trend.direction === 'up' ? COLORS.success : COLORS.error }
          ]}>
            {trend.percentage}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginRight: SPACING.md,
    width: 140,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: SPACING.xs,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
