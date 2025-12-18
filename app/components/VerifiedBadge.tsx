import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export default function VerifiedBadge({ 
  size = 'medium', 
  showLabel = true,
  variant = 'default' 
}: VerifiedBadgeProps) {
  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20,
  };

  const fontSize = {
    small: FONT_SIZES.xs,
    medium: FONT_SIZES.sm,
    large: FONT_SIZES.base,
  };

  if (variant === 'minimal') {
    return (
      <Ionicons 
        name="checkmark-circle" 
        size={iconSizes[size]} 
        color={COLORS.verified} 
      />
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.compactBadge, size === 'small' && styles.compactBadgeSmall]}>
        <Ionicons name="checkmark-circle" size={iconSizes[size]} color={COLORS.white} />
        {showLabel && <Text style={[styles.compactText, { fontSize: fontSize[size] }]}>Verified</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.badge, size === 'small' && styles.badgeSmall]}>
      <Ionicons name="shield-checkmark" size={iconSizes[size]} color={COLORS.verified} />
      {showLabel && (
        <Text style={[styles.text, { fontSize: fontSize[size] }]}>
          Verified by ConnectO
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.verified + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  text: {
    color: COLORS.verified,
    fontWeight: '600',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.verified,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  compactBadgeSmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  compactText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
