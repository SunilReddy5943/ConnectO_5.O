import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function SafetyPromiseCard() {
  const features = [
    { icon: 'shield-checkmark', text: 'Verified workers' },
    { icon: 'lock-closed', text: 'Secure chats' },
    { icon: 'star', text: 'Transparent ratings' },
    { icon: 'people', text: 'Community moderation' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={28} color={COLORS.verified} />
        <Text style={styles.title}>ConnectO Safety Promise</Text>
      </View>
      
      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.feature}>
            <Ionicons name={feature.icon as any} size={16} color={COLORS.success} />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.footerText}>
          All workers undergo verification before joining the platform
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.verified + '08',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.verified + '20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  features: {
    gap: SPACING.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
