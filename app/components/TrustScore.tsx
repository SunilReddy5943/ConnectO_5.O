import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TrustScoreProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function TrustScore({ score, size = 'medium', showLabel = true }: TrustScoreProps) {
  const dimensions = {
    small: 48,
    medium: 72,
    large: 96,
  };

  const fontSize = {
    small: FONT_SIZES.sm,
    medium: FONT_SIZES.xl,
    large: FONT_SIZES['2xl'],
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.verified;
    if (score >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const color = getScoreColor(score);
  const dim = dimensions[size];

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: dim, height: dim, borderColor: color }]}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { fontSize: fontSize[size], color }]}>
            {score}
          </Text>
          <Text style={[styles.percentText, { color }]}>%</Text>
        </View>
      </View>
      {showLabel && (
        <Text style={styles.label}>Trust Score</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    borderRadius: 999,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '700',
  },
  percentText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: 2,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
});
