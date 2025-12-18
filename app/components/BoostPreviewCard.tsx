import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface BoostPreviewCardProps {
  onLearnMore?: () => void;
}

export default function BoostPreviewCard({ onLearnMore }: BoostPreviewCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.secondaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>🚀</Text>
            <Text style={styles.title}>Boost Your Profile</Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.benefits}>
          <View style={styles.benefitRow}>
            <Ionicons name="trophy" size={16} color={COLORS.white} />
            <Text style={styles.benefitText}>Appear at the top of search results</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="eye" size={16} color={COLORS.white} />
            <Text style={styles.benefitText}>Get up to 5× more profile views</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="briefcase" size={16} color={COLORS.white} />
            <Text style={styles.benefitText}>Reach more customers instantly</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.comingSoonButton} 
          onPress={onLearnMore}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={18} color={COLORS.secondary} />
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </TouchableOpacity>

        <Text style={styles.subtext}>Premium feature launching early 2025</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    ...SHADOWS.lg,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
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
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefits: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
    flex: 1,
  },
  comingSoonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  subtext: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
