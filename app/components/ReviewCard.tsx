import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
  job_type?: string;
}

interface ReviewCardProps {
  review: Review;
  variant?: 'default' | 'compact' | 'full';
}

export default function ReviewCard({ review, variant = 'default' }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={variant === 'compact' ? 12 : 14}
            color={star <= rating ? COLORS.star : COLORS.borderLight}
          />
        ))}
      </View>
    );
  };

  if (variant === 'full') {
    return (
      <View style={styles.fullCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={[styles.reviewerAvatar, variant === 'full' && styles.reviewerAvatarLarge]}>
              <Text style={[styles.reviewerInitial, variant === 'full' && styles.reviewerInitialLarge]}>
                {review.customer_name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.reviewerName}>{review.customer_name}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          </View>
          {renderStars(review.rating)}
        </View>
        {review.job_type && (
          <View style={styles.jobTypeBadge}>
            <Text style={styles.jobTypeText}>{review.job_type}</Text>
          </View>
        )}
        <Text style={styles.reviewComment}>{review.comment}</Text>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactName}>{review.customer_name}</Text>
          {renderStars(review.rating)}
        </View>
        <Text style={styles.compactComment} numberOfLines={2}>
          "{review.comment}"
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {review.customer_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{review.customer_name}</Text>
          {renderStars(review.rating)}
        </View>
        <Text style={styles.date}>{review.date}</Text>
      </View>

      <Text style={styles.comment}>"{review.comment}"</Text>

      {review.job_type && (
        <View style={styles.jobTypeContainer}>
          <Ionicons name="briefcase-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.jobType}>{review.job_type}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Full variant
  fullCard: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  reviewerAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  reviewerInitial: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewerInitialLarge: {
    fontSize: FONT_SIZES.xl,
  },
  reviewerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jobTypeBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  jobTypeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Default variant
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  comment: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  jobTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  jobType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  // Compact variant
  compactCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  compactName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  compactComment: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
