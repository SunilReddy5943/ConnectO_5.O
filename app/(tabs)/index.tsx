import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, CATEGORIES, HERO_IMAGE } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import { useDeal } from '../context/DealContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import WorkerCard from '../components/WorkerCard';
import LiveStatusCard from '../components/LiveStatusCard';
import { FEATURED_WORKERS, DUMMY_WORKERS } from '../data/dummyWorkers';
import { DUMMY_EARNINGS_OVERVIEW, DUMMY_PERFORMANCE_METRICS } from '../data/earningsData';
import { DUMMY_PERFORMANCE_METRICS as WORKER_PERFORMANCE_METRICS } from '../data/workerGrowthData';
import { DUMMY_JOB_REQUESTS, getTodayJobsCount, getPendingPayouts } from '../data/jobRequestsData';
import { sortByDistance } from '../lib/locationService';

// Worker-focused components
import WorkerHeader from '../components/worker/WorkerHeader';
import TodayEarningsSummary from '../components/worker/TodayEarningsSummary';
import JobRequestsList from '../components/worker/JobRequestsList';
import WorkerPerformanceSummary from '../components/worker/WorkerPerformanceSummary';
import QuickActionsGrid from '../components/worker/QuickActionsGrid';
import WeeklySummaryCard from '../components/worker/WeeklySummaryCard';
import RecentJobsCard from '../components/worker/RecentJobsCard';
import ActiveJobCard from '../components/worker/ActiveJobCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, activeRole, isWorkerAvailable } = useAuth();
  const { unreadCount } = useApp();
  const { userLocation, getNearbyRadius } = useLocation();
  const { getActiveDealForWorker, getActiveDealForCustomer, updateWorkStatus } = useDeal();

  // State
  const [refreshing, setRefreshing] = useState(false);

  const isWorkerMode = activeRole === 'WORKER';

  // Get active deal for live status card - memoized to prevent unnecessary re-renders
  const activeDeal = useMemo(() => {
    if (!user) return undefined;
    return isWorkerMode
      ? getActiveDealForWorker(user.id)
      : getActiveDealForCustomer(user.id);
  }, [user, isWorkerMode, getActiveDealForWorker, getActiveDealForCustomer]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSearch = () => {
    router.push('/(tabs)/search');
  };

  const handleNearMe = () => {
    router.push({
      pathname: '/(tabs)/search',
      params: { nearMe: 'true', radius: getNearbyRadius().toString() },
    });
  };

  const handleVoiceSearch = () => {
    router.push({
      pathname: '/(tabs)/search',
      params: { voiceMode: 'true' },
    });
  };

  const handleBecomeWorker = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/auth/worker-register');
  };

  const handleViewEarnings = () => {
    router.push('/(tabs)/earnings');
  };

  // Get nearby workers based on user location
  const nearbyWorkers = userLocation
    ? sortByDistance(DUMMY_WORKERS.filter(w => w.availability_status === 'AVAILABLE'), userLocation).slice(0, 10)
    : DUMMY_WORKERS.filter(w => w.city === 'Mumbai' && w.availability_status === 'AVAILABLE').slice(0, 10);

  // State for job requests
  const [jobRequests, setJobRequests] = useState(DUMMY_JOB_REQUESTS);

  // Worker actions
  const handleToggleAvailability = useCallback(() => {
    // This would call the actual availability API
    Alert.alert(
      isWorkerAvailable ? 'Go Offline?' : 'Go Online?',
      isWorkerAvailable
        ? 'You won\'t receive new job requests while offline.'
        : 'You\'ll start receiving job requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Toggle availability logic here
            console.log('Availability toggled');
          }
        },
      ]
    );
  }, [isWorkerAvailable]);

  const handleAcceptRequest = useCallback((requestId: string) => {
    Alert.alert('Accept Job', 'Are you sure you want to accept this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          setJobRequests(prev => prev.filter(r => r.id !== requestId));
          Alert.alert('Success', 'Job accepted! Customer will be notified.');
        },
      },
    ]);
  }, []);

  const handleRejectRequest = useCallback((requestId: string) => {
    setJobRequests(prev => prev.filter(r => r.id !== requestId));
  }, []);

  const handleCallCustomer = useCallback((requestId: string) => {
    const request = jobRequests.find(r => r.id === requestId);
    Alert.alert('Call Customer', `Call ${request?.customerName}?`);
  }, [jobRequests]);

  const handleMessageCustomer = useCallback((requestId: string) => {
    const request = jobRequests.find(r => r.id === requestId);
    router.push({
      pathname: '/chat/[id]',
      params: { id: requestId },
    });
  }, [router, jobRequests]);

  // Worker Mode Home
  if (isWorkerMode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Clean Worker Header */}
        <WorkerHeader
          worker={user}
          isAvailable={isWorkerAvailable}
          onToggleAvailability={handleToggleAvailability}
          unreadNotifications={unreadCount}
          onProfilePress={() => router.push('/(tabs)/profile')}
          onNotificationsPress={() => router.push('/notifications')}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        >
          {/* Live Status Card - Keep for active jobs */}
          {activeDeal && (
            <LiveStatusCard
              deal={activeDeal}
              isWorker={true}
              onUpdateStatus={updateWorkStatus}
            />
          )}

          {/* Quick Actions Grid - NEW */}
          <QuickActionsGrid />

          {/* Today's Earnings - PRIORITY */}
          <TodayEarningsSummary
            todayEarnings={DUMMY_EARNINGS_OVERVIEW.today}
            jobsCompletedToday={getTodayJobsCount()}
            pendingPayouts={getPendingPayouts()}
            onViewDetails={handleViewEarnings}
          />

          {/* Job Requests - MOST IMPORTANT */}
          <JobRequestsList
            requests={jobRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onCall={handleCallCustomer}
            onMessage={handleMessageCustomer}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />

          {/* Weekly Summary - NEW */}
          <WeeklySummaryCard
            weeklyEarnings={8450}
            jobsCompleted={12}
            percentChange={15}
            onViewDetails={handleViewEarnings}
          />

          {/* Recent Completed Jobs - NEW */}
          <RecentJobsCard
            jobs={[
              { id: '1', title: 'AC Repair', earnings: 850, date: 'Today', customerName: 'Priya S.' },
              { id: '2', title: 'Wiring Fix', earnings: 1200, date: 'Yesterday', customerName: 'Rahul M.' },
              { id: '3', title: 'Fan Installation', earnings: 400, date: 'Yesterday', customerName: 'Amit K.' },
            ]}
            onViewAll={handleViewEarnings}
          />

          {/* Mini Performance Summary */}
          <WorkerPerformanceSummary
            responseRate={WORKER_PERFORMANCE_METRICS.responseRate}
            acceptanceRate={WORKER_PERFORMANCE_METRICS.acceptanceRate}
            averageRating={WORKER_PERFORMANCE_METRICS.averageRating}
            onViewAnalytics={handleViewEarnings}
          />

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Customer Mode Home
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showLocation showProfile showNotifications />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Live Status Card */}
        {activeDeal && (
          <LiveStatusCard
            deal={activeDeal}
            isWorker={false}
          />
        )}

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Find Skilled Workers</Text>
            <Text style={styles.heroSubtitle}>Plumbers, Electricians, Carpenters & more</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            editable={false}
            onPress={handleSearch}
            onVoicePress={handleVoiceSearch}
            placeholder="Search by skill, name, or location..."
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleVoiceSearch}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="mic" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Voice Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleNearMe}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="location" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionText}>Near Me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSearch}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="search" size={24} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionText}>Browse All</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.slice(0, 10).map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Workers</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {FEATURED_WORKERS.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} variant="featured" />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workers Near You</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {nearbyWorkers.slice(0, 5).map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </View>

        {/* Jobs Summary Card - Removed */}

        {/* Become Worker CTA */}
        <View style={styles.becomeWorkerCard}>
          <View style={styles.becomeWorkerIcon}>
            <Ionicons name="construct" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.becomeWorkerTitle}>Are you a skilled professional?</Text>
          <Text style={styles.becomeWorkerSubtext}>
            Offer your services and earn money on ConnectO
          </Text>
          <View style={styles.becomeWorkerBenefits}>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.benefitText}>Flexible work hours</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.benefitText}>Earn on your terms</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.benefitText}>Grow your business</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.becomeWorkerButton} onPress={handleBecomeWorker}>
            <Text style={styles.becomeWorkerButtonText}>Become a Worker</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How ConnectO Works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="search" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>Search</Text>
              <Text style={styles.stepDesc}>Find workers by skill</Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Ionicons name="person" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.stepTitle}>Choose</Text>
              <Text style={styles.stepDesc}>Compare profiles</Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="chatbubbles" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.stepTitle}>Connect</Text>
              <Text style={styles.stepDesc}>Chat and hire</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>10K+</Text>
            <Text style={styles.statLabel}>Workers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50K+</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>100+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    height: 180,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: SPACING.base,
    marginTop: -26,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.base,
  },
  featuredScroll: {
    paddingHorizontal: SPACING.base,
  },
  howItWorks: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  howItWorksTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  stepDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.base,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white + '30',
  },
  bottomPadding: {
    height: SPACING['2xl'],
  },
  // Worker Growth Dashboard Styles
  growthHeader: {
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  growthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  growthTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  growthSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  metricsScroll: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  growthSection: {
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.lg,
  },
  titleRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  // Worker Mode Styles
  busyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  busyBannerText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  busyBannerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  busyBannerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  earningsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  earningsValue: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.secondary,
  },
  earningsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  earningsIconButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  earningsStatItem: {
    alignItems: 'center',
  },
  earningsStatValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  earningsStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  viewDetailsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  workRequestsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  workRequestIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workRequestInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  workRequestCount: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workRequestSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  workRequestButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  workRequestButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  performanceTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  performanceMetrics: {
    gap: SPACING.md,
  },
  performanceItem: {},
  performanceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success,
  },
  performanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  crossRoleCard: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  crossRoleTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  crossRoleSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  crossRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  crossRoleButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  // Customer Mode Styles
  jobsSummaryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  jobsSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobsSummaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  jobsSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  jobsSummaryStatItem: {
    alignItems: 'center',
  },
  jobsSummaryStatValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  jobsSummaryStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  jobsSummaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  jobsSummaryCTAText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  becomeWorkerCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  becomeWorkerIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  becomeWorkerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  becomeWorkerSubtext: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  becomeWorkerBenefits: {
    alignSelf: 'stretch',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  becomeWorkerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  becomeWorkerButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
});
