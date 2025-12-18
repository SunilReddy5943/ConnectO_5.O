import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, CATEGORIES, WORKER_IMAGES } from '../constants/theme';
import Button from '../components/ui/Button';
import TrustReassuranceBanner from '../components/TrustReassuranceBanner';
import VerifiedBadge from '../components/VerifiedBadge';

interface Applicant {
  id: string;
  name: string;
  photo: string;
  category: string;
  rating: number;
  experience: number;
  proposedRate: number;
  message: string;
  appliedAt: string;
}

const DUMMY_APPLICANTS: Applicant[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    photo: WORKER_IMAGES[0],
    category: 'Plumber',
    rating: 4.8,
    experience: 12,
    proposedRate: 800,
    message: 'I have extensive experience in bathroom plumbing. I can fix this issue quickly.',
    appliedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Suresh Singh',
    photo: WORKER_IMAGES[1],
    category: 'Plumber',
    rating: 4.5,
    experience: 8,
    proposedRate: 700,
    message: 'I specialize in leak repairs. Available to come today if needed.',
    appliedAt: '4 hours ago',
  },
  {
    id: '3',
    name: 'Mahesh Sharma',
    photo: WORKER_IMAGES[2],
    category: 'Plumber',
    rating: 4.9,
    experience: 15,
    proposedRate: 1000,
    message: 'Senior plumber with 15 years experience. Quality work guaranteed.',
    appliedAt: '6 hours ago',
  },
];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'applicants'>('details');

  const job = {
    id: id || '1',
    title: 'Bathroom Plumbing Repair',
    description: 'Need to fix a leaking pipe in the bathroom. Water is dripping from under the sink. The leak has been ongoing for a few days and needs urgent attention. Please bring all necessary tools and materials.',
    category: 'Plumber',
    city: 'Mumbai',
    locality: 'Andheri West',
    budget_min: 500,
    budget_max: 1500,
    status: 'OPEN',
    urgency: 'URGENT',
    applications_count: 5,
    created_at: '2025-12-11T10:00:00Z',
    customer_name: 'Amit Sharma',
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewWorker = (workerId: string) => {
    router.push({
      pathname: '/worker/[id]',
      params: { id: workerId },
    });
  };

  const handleAcceptApplicant = (applicantId: string) => {
    // Handle accept logic
  };

  const handleMessageApplicant = (applicantId: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: applicantId },
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.name === category);
    return cat?.icon || 'construct';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return COLORS.success;
      case 'ASSIGNED':
        return COLORS.info;
      case 'IN_PROGRESS':
        return COLORS.warning;
      case 'COMPLETED':
        return COLORS.primary;
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const renderApplicant = ({ item }: { item: Applicant }) => (
    <View style={styles.applicantCard}>
      <TouchableOpacity
        style={styles.applicantHeader}
        onPress={() => handleViewWorker(item.id)}
      >
        <Image source={{ uri: item.photo }} style={styles.applicantPhoto} />
        <View style={styles.applicantInfo}>
          <View style={styles.applicantNameRow}>
            <Text style={styles.applicantName}>{item.name}</Text>
            <VerifiedBadge size="small" variant="minimal" />
          </View>
          <View style={styles.applicantMeta}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.star} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.experienceText}>{item.experience} yrs exp</Text>
          </View>
        </View>
        <View style={styles.proposedRate}>
          <Text style={styles.rateLabel}>Proposed</Text>
          <Text style={styles.rateValue}>₹{item.proposedRate}/day</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.applicantMessage}>"{item.message}"</Text>
      
      <View style={styles.applicantFooter}>
        <Text style={styles.appliedTime}>{item.appliedAt}</Text>
        <View style={styles.applicantActions}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessageApplicant(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptApplicant(item.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applicants' && styles.tabActive]}
          onPress={() => setActiveTab('applicants')}
        >
          <Text style={[styles.tabText, activeTab === 'applicants' && styles.tabTextActive]}>
            Applicants ({DUMMY_APPLICANTS.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name={getCategoryIcon(job.category) as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.jobHeaderInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCategory}>{job.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                  {job.status}
                </Text>
              </View>
            </View>

            <View style={styles.urgencyRow}>
              <View style={[styles.urgencyBadge, { backgroundColor: COLORS.error + '15' }]}>
                <Ionicons name="flash" size={14} color={COLORS.error} />
                <Text style={[styles.urgencyText, { color: COLORS.error }]}>{job.urgency}</Text>
              </View>
              <Text style={styles.postedTime}>Posted 2 hours ago</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.locationText}>{job.locality}, {job.city}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.budgetContainer}>
              <Text style={styles.budgetValue}>₹{job.budget_min} - ₹{job.budget_max}</Text>
              <Text style={styles.budgetLabel}>per day</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerInitial}>{job.customer_name.charAt(0)}</Text>
              </View>
              <Text style={styles.customerName}>{job.customer_name}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Edit Job"
              variant="outline"
              onPress={() => {}}
              style={styles.editButton}
            />
            <Button
              title="Cancel Job"
              variant="ghost"
              onPress={() => {}}
              textStyle={{ color: COLORS.error }}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.applicantsContainer}>
          <View style={styles.trustBannerContainer}>
            <TrustReassuranceBanner 
              message="All applicants are verified workers" 
              variant="verified"
            />
          </View>
          <FlatList
            data={DUMMY_APPLICANTS}
            keyExtractor={(item) => item.id}
            renderItem={renderApplicant}
            contentContainerStyle={styles.applicantsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No applicants yet</Text>
                <Text style={styles.emptySubtitle}>
                  Workers will start applying soon
                </Text>
              </View>
            }
          />
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  jobTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  jobCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  urgencyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  postedTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  budgetValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  budgetLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitial: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  customerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
  },
  editButton: {
    flex: 1,
  },
  applicantsContainer: {
    flex: 1,
  },
  trustBannerContainer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
  },
  applicantsList: {
    padding: SPACING.base,
  },
  applicantCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.borderLight,
  },
  applicantInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  applicantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  applicantName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  applicantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.star + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 2,
  },
  experienceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  proposedRate: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  rateValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  applicantMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  applicantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  appliedTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  applicantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  acceptButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
