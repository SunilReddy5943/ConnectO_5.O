import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { OptimizationTip } from '../data/workerGrowthData';

interface OptimizationTipCardProps {
  tip: OptimizationTip;
  onAction: () => void;
}

export default function OptimizationTipCard({ tip, onAction }: OptimizationTipCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.info;
      default:
        return COLORS.textMuted;
    }
  };

  const priorityColor = getPriorityColor(tip.priority);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: priorityColor + '15' }]}>
          <Ionicons name={tip.icon as any} size={20} color={priorityColor} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.description}>{tip.description}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.actionText}>{tip.action}</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
