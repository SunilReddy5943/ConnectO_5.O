import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import TrustInsightsCard from '../components/TrustInsightsCard';
import ProfileCompletenessBar from '../components/ProfileCompletenessBar';
import {
  DUMMY_EARNINGS_OVERVIEW,
  DUMMY_MONTHLY_EARNINGS,
  DUMMY_WEEKLY_EARNINGS,
  DUMMY_EARNINGS_BY_SKILL,
  DUMMY_EARNINGS_BY_CITY,
  DUMMY_PERFORMANCE_METRICS,
  DUMMY_VISIBILITY_METRICS,
  DUMMY_RATING_TRENDS,
  DUMMY_SMART_INSIGHTS,
  EarningsOverview,
} from '../data/earningsData';
import { DUMMY_USER_REFERRAL_PROFILE } from '../data/referralData';

const { width } = Dimensions.get('window');

type TimeFilter = '7days' | '30days' | '90days' | 'lifetime';

export default function EarningsScreen() {
  const router = useRouter();
  const { activeRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');

  // Redirect if not worker
  if (activeRole !== 'WORKER') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.accessDeniedText}>Worker Access Only</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getFilteredEarnings = (): number => {
    switch (timeFilter) {
      case '7days':
        return DUMMY_EARNINGS_OVERVIEW.last7Days;
      case '30days':
        return DUMMY_EARNINGS_OVERVIEW.last30Days;
      case '90days':
        return DUMMY_EARNINGS_OVERVIEW.last90Days;
      case 'lifetime':
        return DUMMY_EARNINGS_OVERVIEW.totalLifetime;
      default:
        return DUMMY_EARNINGS_OVERVIEW.last30Days;
    }
  };

  const timeFilters: { label: string; value: TimeFilter }[] = [
    { label: '7 Days', value: '7days' },
    { label: '30 Days', value: '30days' },
    { label: '90 Days', value: '90days' },
    { label: 'Lifetime', value: 'lifetime' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Earnings & Analytics</Text>
            <Text style={styles.headerSubtitle}>Track your growth</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Time Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {timeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                timeFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setTimeFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Earnings Overview Cards */}
        <View style={styles.overviewSection}>
          {/* Main Earnings Card */}
          <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
            <View style={styles.mainCardHeader}>
              <Ionicons name="wallet" size={28} color={COLORS.white} />
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={14} color={COLORS.success} />
                <Text style={styles.trendText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.mainCardLabel}>
              {timeFilter === 'lifetime' ? 'Total Earnings' : `Last ${timeFilters.find(f => f.value === timeFilter)?.label}`}
            </Text>
            <Text style={styles.mainCardValue}>{formatCurrency(getFilteredEarnings())}</Text>
            <View style={styles.mainCardFooter}>
              <View style={styles.mainCardStat}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                <Text style={styles.mainCardStatText}>
                  {DUMMY_PERFORMANCE_METRICS.totalJobsCompleted} jobs
                </Text>
              </View>
              <View style={styles.mainCardStat}>
                <Ionicons name="star" size={16} color={COLORS.white} />
                <Text style={styles.mainCardStatText}>
                  {DUMMY_PERFORMANCE_METRICS.averageRating} rating
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="today" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>{formatCurrency(DUMMY_EARNINGS_OVERVIEW.today)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="calendar" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>{formatCurrency(DUMMY_EARNINGS_OVERVIEW.thisMonth)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="calculator" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statLabel}>Avg/Day</Text>
              <Text style={styles.statValue}>
                {formatCurrency(Math.round(DUMMY_EARNINGS_OVERVIEW.last30Days / 30))}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                <Ionicons name="cash" size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.statLabel}>Avg/Job</Text>
              <Text style={styles.statValue}>
                {formatCurrency(DUMMY_PERFORMANCE_METRICS.averageJobValue)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Insights */}
        <View style={styles.section}>
          <TrustInsightsCard 
            verified={true}
            completionRate={DUMMY_PERFORMANCE_METRICS.completionRate}
            averageRating={DUMMY_PERFORMANCE_METRICS.averageRating}
          />
        </View>

        {/* Profile Completeness */}
        <View style={styles.section}>
          <ProfileCompletenessBar 
            percentage={85}
            showCTA
            onCTAPress={() => router.push('/profile')}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <Ionicons name="analytics" size={20} color={COLORS.primary} />
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricValue}>{DUMMY_PERFORMANCE_METRICS.completionRate}%</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.metricLabel}>Completion Rate</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${DUMMY_PERFORMANCE_METRICS.completionRate}%`,
                      backgroundColor: COLORS.success,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricValue}>{DUMMY_PERFORMANCE_METRICS.acceptanceRate}%</Text>
                <Ionicons name="hand-right" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.metricLabel}>Acceptance Rate</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${DUMMY_PERFORMANCE_METRICS.acceptanceRate}%`,
                      backgroundColor: COLORS.info,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Referral Summary Card */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.referralCard}
            onPress={() => router.push('/referral')}
            activeOpacity={0.7}
          >
            <View style={styles.referralHeader}>
              <View style={styles.referralIconContainer}>
                <Ionicons name="gift" size={28} color={COLORS.warning} />
              </View>
              <View style={styles.referralContent}>
                <Text style={styles.referralTitle}>Refer & Earn More!</Text>
                <Text style={styles.referralSubtitle}>
                  {DUMMY_USER_REFERRAL_PROFILE.successfulReferrals} successful referrals
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
            </View>
            
            <View style={styles.referralStats}>
              <View style={styles.referralStatItem}>
                <Text style={styles.referralStatValue}>{DUMMY_USER_REFERRAL_PROFILE.totalReferrals}</Text>
                <Text style={styles.referralStatLabel}>Total</Text>
              </View>
              <View style={styles.referralStatDivider} />
              <View style={styles.referralStatItem}>
                <Text style={styles.referralStatValue}>{DUMMY_USER_REFERRAL_PROFILE.pendingReferrals}</Text>
                <Text style={styles.referralStatLabel}>Pending</Text>
              </View>
              <View style={styles.referralStatDivider} />
              <View style={styles.referralStatItem}>
                <Text style={[styles.referralStatValue, { color: COLORS.success }]}>
                  {formatCurrency(DUMMY_USER_REFERRAL_PROFILE.totalEarnings)}
                </Text>
                <Text style={styles.referralStatLabel}>Earned</Text>
              </View>
            </View>

            <View style={styles.referralCTA}>
              <Ionicons name="share-social" size={16} color={COLORS.primary} />
              <Text style={styles.referralCTAText}>Share Your Referral Code</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Smart Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Insights</Text>
            <Ionicons name="bulb" size={20} color={COLORS.warning} />
          </View>

          {DUMMY_SMART_INSIGHTS.slice(0, 3).map((insight) => (
            <TouchableOpacity key={insight.id} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                <Ionicons name={insight.icon as any} size={20} color={insight.color} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Visibility Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visibility & Growth</Text>
            <Ionicons name="eye" size={20} color={COLORS.primary} />
          </View>

          <View style={styles.visibilityGrid}>
            <View style={styles.visibilityCard}>
              <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
              <Text style={styles.visibilityValue}>
                {DUMMY_VISIBILITY_METRICS.profileViews.thisMonth}
              </Text>
              <Text style={styles.visibilityLabel}>Profile Views</Text>
              <Text style={styles.visibilitySubtext}>This month</Text>
            </View>

            <View style={styles.visibilityCard}>
              <Ionicons name="search-outline" size={24} color={COLORS.secondary} />
              <Text style={styles.visibilityValue}>
                {DUMMY_VISIBILITY_METRICS.searchAppearances.thisMonth}
              </Text>
              <Text style={styles.visibilityLabel}>Appearances</Text>
              <Text style={styles.visibilitySubtext}>In searches</Text>
            </View>

            <View style={styles.visibilityCard}>
              <Ionicons name="call-outline" size={24} color={COLORS.success} />
              <Text style={styles.visibilityValue}>
                {DUMMY_VISIBILITY_METRICS.contactRequests.thisMonth}
              </Text>
              <Text style={styles.visibilityLabel}>Contacts</Text>
              <Text style={styles.visibilitySubtext}>Received</Text>
            </View>

            <View style={styles.visibilityCard}>
              <Ionicons name="trending-up-outline" size={24} color={COLORS.warning} />
              <Text style={styles.visibilityValue}>
                {DUMMY_VISIBILITY_METRICS.conversionRate}%
              </Text>
              <Text style={styles.visibilityLabel}>Conversion</Text>
              <Text style={styles.visibilitySubtext}>Views to jobs</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="download-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Download Report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.actionButtonText}>View Detailed Analytics</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterContent: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  overviewSection: {
    padding: SPACING.base,
  },
  mainCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    ...SHADOWS.lg,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  mainCardLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  mainCardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  mainCardFooter: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  mainCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  mainCardStatText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  statCard: {
    width: (width - SPACING.base * 2 - SPACING.xs * 2) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    margin: SPACING.xs,
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    padding: SPACING.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginHorizontal: -SPACING.xs,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  visibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  visibilityCard: {
    width: (width - SPACING.base * 2 - SPACING.xs * 6) / 2,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
  },
  visibilityValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  visibilityLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  visibilitySubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessDeniedText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  referralCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  referralIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  referralContent: {
    flex: 1,
  },
  referralTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  referralSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  referralStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  referralStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  referralStatDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
  },
  referralCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  referralCTAText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  bottomSpace: {
    height: 20,
  },
});
