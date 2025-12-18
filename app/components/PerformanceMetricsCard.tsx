import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { PerformanceMetrics } from '../data/workerGrowthData';

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetrics;
}

export default function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return COLORS.success;
    if (value >= 75) return COLORS.verified;
    if (value >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const performanceItems = [
    {
      icon: 'checkmark-circle',
      label: 'Completion Rate',
      value: metrics.completionRate,
      suffix: '%',
      color: getPerformanceColor(metrics.completionRate),
    },
    {
      icon: 'hand-right',
      label: 'Acceptance Rate',
      value: metrics.acceptanceRate,
      suffix: '%',
      color: getPerformanceColor(metrics.acceptanceRate),
    },
    {
      icon: 'time',
      label: 'Avg Response Time',
      value: metrics.averageResponseTime,
      suffix: '',
      color: COLORS.info,
    },
    {
      icon: 'star',
      label: 'Customer Rating',
      value: metrics.averageRating.toFixed(1),
      suffix: ' ⭐',
      color: COLORS.star,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="analytics" size={20} color={COLORS.primary} />
          <Text style={styles.title}>Performance</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {performanceItems.map((item, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
            
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: item.color }]}>
                {item.value}{item.suffix}
              </Text>
            </View>
            
            {typeof item.value === 'number' && item.suffix === '%' && (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${item.value}%`,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.md,
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
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricsGrid: {
    gap: SPACING.md,
  },
  metricItem: {
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  metricValueRow: {
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
});
