import React, { useCallback, memo, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { DummyWorker } from '../data/dummyWorkers';
import { formatDistance } from '../lib/locationService';
import VerifiedBadge from './VerifiedBadge';
import NotifyButton from './NotifyButton';
import { useWorkerNotify } from '../context/WorkerNotifyContext';
import { NotifyStatus } from '../lib/workerNotifyTypes';

interface WorkerCardProps {
  worker: DummyWorker & { distance?: number }; // Distance in km
  variant?: 'default' | 'compact' | 'featured';
}

function WorkerCard({ worker, variant = 'default' }: WorkerCardProps) {
  const router = useRouter();
  const { toggleSavedWorker, isWorkerSaved } = useApp();
  const saved = isWorkerSaved(worker.id);

  // Get notify context (may not be available in all contexts)
  let notifyContext: ReturnType<typeof useWorkerNotify> | null = null;
  try {
    notifyContext = useWorkerNotify();
  } catch {
    // Context not available, notify button will be hidden
  }

  const notifyState = notifyContext?.getWorkerStatus(worker.id) || { status: NotifyStatus.READY, cooldownSeconds: 0 };

  // Refresh cooldown on mount
  useEffect(() => {
    if (notifyContext && variant === 'default') {
      notifyContext.refreshCooldown(worker.id);
    }
  }, [worker.id]);

  const handleNotifyPress = useCallback(() => {
    if (notifyContext) {
      notifyContext.openNotifyModal(worker.id, worker.name);
    }
  }, [notifyContext, worker.id, worker.name]);

  const handleCall = useCallback(() => {
    // In production, use worker's actual phone number
    const phoneNumber = '+91' + Math.floor(Math.random() * 9000000000 + 1000000000);
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleMessage = useCallback(() => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: worker.id },
    });
  }, [worker.id, router]);

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/worker/[id]',
      params: { id: worker.id },
    });
  }, [worker.id]);

  const handleSave = useCallback(() => {
    toggleSavedWorker(worker.id);
  }, [worker.id, toggleSavedWorker]);

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        {worker.profile_photo_url ? (
          <Image
            source={{ uri: worker.profile_photo_url }}
            style={styles.compactImage}
          />
        ) : (
          <View style={[styles.compactImage, styles.imageFallback]}>
            <Ionicons name="person" size={24} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{worker.name}</Text>
          <Text style={styles.compactCategory}>{worker.primary_category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.star} />
            <Text style={styles.compactRating}>{worker.rating_average.toFixed(1)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={handlePress} activeOpacity={0.8}>
        <Image source={{ uri: worker.profile_photo_url }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay}>
          {worker.kyc_status === 'VERIFIED' && (
            <VerifiedBadge size="small" variant="compact" />
          )}
        </View>
        <View style={styles.featuredInfo}>
          <View style={styles.featuredNameRow}>
            <Text style={styles.featuredName} numberOfLines={1}>{worker.name}</Text>
            {worker.kyc_status === 'VERIFIED' && (
              <Ionicons name="checkmark-circle" size={14} color={COLORS.verified} />
            )}
          </View>
          <Text style={styles.featuredCategory}>{worker.primary_category}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.featuredRating}>{worker.rating_average.toFixed(1)}</Text>
              <Text style={styles.featuredReviews}>({worker.rating_count})</Text>
            </View>
            <Text style={styles.featuredWage}>₹{worker.daily_wage_min}/day</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: worker.profile_photo_url }} style={styles.image} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{worker.name}</Text>
            {worker.kyc_status === 'VERIFIED' && (
              <VerifiedBadge size="small" variant="minimal" />
            )}
          </View>
          <Text style={styles.category}>{worker.primary_category}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.location}>
              {worker.distance !== undefined ? formatDistance(worker.distance) : worker.city}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={22}
            color={saved ? COLORS.error : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.skillsRow}>
        {worker.sub_skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {worker.sub_skills.length > 3 && (
          <View style={styles.moreChip}>
            <Text style={styles.moreText}>+{worker.sub_skills.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaItem}>
          <Ionicons name="star" size={16} color={COLORS.star} />
          <Text style={styles.metaValue}>{worker.rating_average.toFixed(1)}</Text>
          <Text style={styles.metaLabel}>({worker.rating_count})</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.metaValue}>{worker.years_of_experience}</Text>
          <Text style={styles.metaLabel}>yrs</Text>
        </View>
        <View style={styles.wageContainer}>
          <Text style={styles.wageValue}>₹{worker.daily_wage_min}-{worker.daily_wage_max}</Text>
          <Text style={styles.wageLabel}>/day</Text>
        </View>
      </View>

      {/* Action Bar */}
      {notifyContext && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={18} color={COLORS.success} />
            <Text style={[styles.actionLabel, { color: COLORS.success }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
            <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Message</Text>
          </TouchableOpacity>

          <NotifyButton
            status={notifyState.status}
            cooldownSeconds={notifyState.cooldownSeconds}
            onPress={handleNotifyPress}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(WorkerCard, (prevProps, nextProps) => {
  return (
    prevProps.worker.id === nextProps.worker.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.worker.distance === nextProps.worker.distance
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.borderLight,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  saveButton: {
    padding: SPACING.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  skillChip: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  skillText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moreChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  moreText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  metaValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  metaLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  wageContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wageValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  wageLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  // Compact variant
  compactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    width: 120,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  compactImage: {
    width: '100%',
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.borderLight,
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    marginTop: SPACING.sm,
  },
  compactName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  compactCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  compactRating: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  // Featured variant
  featuredCard: {
    width: 180,
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  featuredImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.borderLight,
  },
  featuredOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.verified,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredInfo: {
    padding: SPACING.md,
  },
  featuredNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featuredName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  featuredCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  featuredRating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  featuredReviews: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  featuredWage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
