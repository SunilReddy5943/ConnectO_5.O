import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TrustReassuranceBannerProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'info' | 'success' | 'verified';
}

export default function TrustReassuranceBanner({ 
  message, 
  icon = 'shield-checkmark',
  variant = 'verified' 
}: TrustReassuranceBannerProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: COLORS.success + '10',
          border: COLORS.success + '30',
          icon: COLORS.success,
          text: COLORS.success,
        };
      case 'info':
        return {
          bg: COLORS.info + '10',
          border: COLORS.info + '30',
          icon: COLORS.info,
          text: COLORS.info,
        };
      case 'verified':
      default:
        return {
          bg: COLORS.verified + '10',
          border: COLORS.verified + '30',
          icon: COLORS.verified,
          text: COLORS.verified,
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Ionicons name={icon} size={16} color={colors.icon} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  message: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    flex: 1,
  },
});
