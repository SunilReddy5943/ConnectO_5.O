import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ProfileCompletenessBarProps {
  percentage: number;
  showCTA?: boolean;
  onCTAPress?: () => void;
}

export default function ProfileCompletenessBar({ 
  percentage, 
  showCTA = true,
  onCTAPress 
}: ProfileCompletenessBarProps) {
  const getStrengthLabel = (pct: number) => {
    if (pct === 100) return 'Excellent';
    if (pct >= 80) return 'Strong';
    if (pct >= 60) return 'Good';
    if (pct >= 40) return 'Fair';
    return 'Weak';
  };

  const getStrengthColor = (pct: number) => {
    if (pct >= 80) return COLORS.success;
    if (pct >= 60) return COLORS.verified;
    if (pct >= 40) return COLORS.warning;
    return COLORS.error;
  };

  const color = getStrengthColor(percentage);
  const label = getStrengthLabel(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="bar-chart" size={16} color={color} />
          <Text style={styles.title}>Profile Strength: </Text>
          <Text style={[styles.strength, { color }]}>{label}</Text>
        </View>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>

      {showCTA && percentage < 100 && (
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={onCTAPress}
          activeOpacity={0.7}
        >
          <Text style={styles.ctaText}>Complete your profile to get more jobs</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  strength: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  percentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: SPACING.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  ctaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    flex: 1,
  },
});
