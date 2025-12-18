import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Achievement } from '../data/workerGrowthData';

interface AchievementsBadgesProps {
  achievements: Achievement[];
  compact?: boolean;
}

export default function AchievementsBadges({ achievements, compact = false }: AchievementsBadgesProps) {
  const renderBadge = (achievement: Achievement) => {
    const isLocked = !achievement.unlocked;

    return (
      <View 
        key={achievement.id} 
        style={[
          styles.badge,
          isLocked && styles.badgeLocked,
          compact && styles.badgeCompact
        ]}
      >
        <View style={[styles.iconContainer, isLocked && styles.iconLocked]}>
          <Text style={[styles.emoji, isLocked && styles.emojiLocked]}>
            {achievement.icon}
          </Text>
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
            </View>
          )}
        </View>
        
        {!compact && (
          <>
            <Text style={[styles.title, isLocked && styles.titleLocked]}>
              {achievement.title}
            </Text>
            <Text style={[styles.description, isLocked && styles.descriptionLocked]}>
              {achievement.description}
            </Text>
            
            {achievement.progress !== undefined && !achievement.unlocked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${achievement.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{achievement.progress}%</Text>
              </View>
            )}
            
            {achievement.unlockedAt && (
              <View style={styles.unlockedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                <Text style={styles.unlockedText}>Unlocked</Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (compact) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactContainer}
      >
        {achievements.map(renderBadge)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trophy" size={20} color={COLORS.secondary} />
          <Text style={styles.headerTitle}>Your Achievements</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {achievements.map(renderBadge)}
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
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  countText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badge: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.secondary + '30',
    ...SHADOWS.sm,
  },
  badgeLocked: {
    backgroundColor: COLORS.borderLight,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  badgeCompact: {
    width: 80,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    alignSelf: 'center',
    position: 'relative',
  },
  iconLocked: {
    backgroundColor: COLORS.borderLight,
  },
  emoji: {
    fontSize: 32,
  },
  emojiLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  titleLocked: {
    color: COLORS.textMuted,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  descriptionLocked: {
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.success + '15',
    borderRadius: BORDER_RADIUS.md,
  },
  unlockedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  compactContainer: {
    paddingRight: SPACING.base,
  },
});
