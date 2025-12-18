import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { VisibilityScore } from '../data/workerGrowthData';

interface VisibilityScoreCardProps {
  visibilityData: VisibilityScore;
  onImprove?: () => void;
}

export default function VisibilityScoreCard({ visibilityData, onImprove }: VisibilityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.verified;
    if (score >= 40) return COLORS.warning;
    return COLORS.error;
  };

  const scoreColor = getScoreColor(visibilityData.score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="eye" size={20} color={COLORS.primary} />
          <Text style={styles.title}>Visibility Score</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{visibilityData.score}%</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>How often customers see your profile</Text>

      <View style={styles.factorsContainer}>
        {Object.entries(visibilityData.factors).map(([key, value]) => {
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          return (
            <View key={key} style={styles.factorRow}>
              <Text style={styles.factorLabel}>{label}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${value}%`,
                        backgroundColor: getScoreColor(value)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.factorValue}>{value}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      {onImprove && (
        <TouchableOpacity style={styles.ctaButton} onPress={onImprove} activeOpacity={0.7}>
          <Ionicons name="trending-up" size={18} color={COLORS.primary} />
          <Text style={styles.ctaText}>Improve Visibility</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
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
    marginBottom: SPACING.xs,
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
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  scoreText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  factorsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  factorValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 35,
    textAlign: 'right',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  ctaText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
