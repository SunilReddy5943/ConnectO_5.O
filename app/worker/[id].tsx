import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, WORKER_IMAGES } from '../constants/theme';
import { DUMMY_WORKERS, DummyWorker } from '../data/dummyWorkers';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useDeal } from '../context/DealContext';
import { useTrust } from '../context/TrustContext';
import Button from '../components/ui/Button';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustScore from '../components/TrustScore';
import SafetyPromiseCard from '../components/SafetyPromiseCard';
import ReviewCard, { Review } from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import TrustBadges from '../components/TrustBadges';
import VerificationLevelBadge from '../components/VerificationLevelBadge';
import TrustMessage from '../components/TrustMessage';
import DealRequestModal from '../components/DealRequestModal';
import WorkerProfileActionBar from '../components/WorkerProfileActionBar';
import NoResponseBanner from '../components/NoResponseBanner';
import NotifyWorkerModal from '../components/NotifyWorkerModal';
import { generateReviewsForWorker, calculateTrustScore, isWorkerVerified } from '../data/dummyReviews';
// Conditionally import MiniMapView only on native platforms
let MiniMapView: any = null;
if (Platform.OS !== 'web') {
  MiniMapView = require('../components/MiniMapView').default;
}
import { useLocation } from '../context/LocationContext';
import ReportUserModal from '../components/ReportUserModal';
import { useAnalytics } from '../hooks/useAnalytics';
import ErrorDisplay from '../components/ErrorDisplay';
const { width } = Dimensions.get('window');



export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, activeRole, user } = useAuth();
  const { logDealSent, logUserReport } = useAnalytics();
  const { toggleSavedWorker, isWorkerSaved, addNotification } = useApp();
  const { getWorkerRating, getWorkerReviews } = useDeal();
  const { getWorkerVerification, getVerificationLevelBadge, getCustomerVerification } = useTrust();
  const { userLocation } = useLocation();

  const [showContactModal, setShowContactModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDealRequestModal, setShowDealRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showNoResponseBanner, setShowNoResponseBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCustomerMode = activeRole === 'CUSTOMER' || !activeRole;

  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const worker = useMemo(() => {
    try {
      const foundWorker = DUMMY_WORKERS.find(w => w.id === id);
      if (!foundWorker) {
        setError('Worker not found');
        return DUMMY_WORKERS[0]; // Fallback to first worker
      }
      return foundWorker;
    } catch (err) {
      setError('Failed to load worker details');
      return DUMMY_WORKERS[0]; // Fallback to first worker
    }
  }, [id]);
  // Get real reviews from DealContext
  const workerRating = useMemo(() => getWorkerRating(worker.id), [worker.id]);
  const verifiedReviews = useMemo(() => getWorkerReviews(worker.id), [worker.id]);

  // Get trust and verification info
  const workerVerification = useMemo(() => getWorkerVerification(worker.id, worker), [worker.id, worker]);
  const levelBadge = useMemo(() => getVerificationLevelBadge(workerVerification.level), [workerVerification.level]);
  const customerVerification = useMemo(() =>
    user ? getCustomerVerification(user.id) : { phoneVerified: false, completedDealsCount: 0 },
    [user]
  );

  // Fallback to dummy reviews for display purposes
  const workerReviews = useMemo(() => generateReviewsForWorker(worker.id, worker.primary_category, worker.rating_count), [worker.id, worker.primary_category, worker.rating_count]);
  const trustScore = useMemo(() => calculateTrustScore(worker), [worker]);
  const isVerified = useMemo(() => isWorkerVerified(worker), [worker]);

  const saved = isWorkerSaved(worker.id);

  const portfolioImages = useMemo(() => {
    return WORKER_IMAGES.slice(0, 6).map((url, index) => ({
      id: `portfolio-${index}`,
      url,
      title: `Project ${index + 1}`,
    }));
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    toggleSavedWorker(worker.id);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setShowContactModal(true);
  };

  const handleStartChat = () => {
    setShowContactModal(false);
    addNotification({
      id: Date.now().toString(),
      title: 'Chat Started',
      body: `You can now chat with ${worker.name}`,
      type: 'CHAT',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    router.push({
      pathname: '/chat/[id]',
      params: { id: worker.id },
    });
  };

  const handleSendDealRequest = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setShowDealRequestModal(true);
  };

  const handleDealRequestSuccess = () => {
    // Log deal sent event
    logDealSent(worker.id, '');

    addNotification({
      id: Date.now().toString(),
      title: 'Deal Request Sent',
      body: `Your request has been sent to ${worker.name}`,
      type: 'DEAL_REQUEST',
      is_read: false,
      created_at: new Date().toISOString(),
    });
  };

  const handleReportUser = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setShowReportModal(true);
  };

  const handleReportSubmit = () => {
    // Log user report event
    logUserReport(worker.id, 'Reported from worker profile');

    // Report has been submitted, close modal
    setShowReportModal(false);
  };

  // New handlers for customer-first UX
  const startResponseTimer = () => {
    // Clear any existing timer
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
    }

    // Start 60-second timer
    responseTimerRef.current = setTimeout(() => {
      setShowNoResponseBanner(true);
    }, 60000); // 60 seconds
  };

  const handleCallNow = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Attempt to call worker (placeholder - will use actual phone later)
    Alert.alert(
      'Call Worker',
      'Call feature will be available soon. For now, use Chat to contact the worker.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Open Chat',
          onPress: handleStartChat,
        },
      ]
    );

    // Start response timer
    startResponseTimer();
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    handleStartChat();
    // Start response timer
    startResponseTimer();
  };

  const handleNotify = () => {
    setShowNoResponseBanner(false);
    setShowNotifyModal(true);
  };

  const handleNotifySubmit = (data: { problem: string; location: string }) => {
    // Create dummy notify record
    console.log('Notify submitted:', {
      workerId: worker.id,
      workerName: worker.name,
      ...data,
      timestamp: new Date().toISOString(),
    });

    setShowNotifyModal(false);

    Alert.alert(
      'Worker Notified',
      "Notified worker. You'll get a response soon.",
      [{ text: 'OK' }]
    );

    addNotification({
      id: Date.now().toString(),
      title: 'Worker Notified',
      body: `${worker.name} has been notified about your request`,
      type: 'SYSTEM',
      is_read: false,
      created_at: new Date().toISOString(),
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={COLORS.star}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>{item.customer_name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{item.customer_name}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        {error ? (
          <View style={styles.container}>
            <ErrorDisplay
              message={error}
              onRetry={() => {
                setError(null);
                // Reload worker data
                const foundWorker = DUMMY_WORKERS.find(w => w.id === id);
                if (!foundWorker) {
                  setError('Worker not found');
                }
              }}
            />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            <View style={styles.headerImage}>
              <Image source={{ uri: worker.profile_photo_url }} style={styles.coverImage} />
              <View style={styles.headerOverlay} />
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                  <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                  <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
                    <Ionicons
                      name={saved ? 'heart' : 'heart-outline'}
                      size={24}
                      color={saved ? COLORS.error : COLORS.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="share-outline" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: worker.profile_photo_url }} style={styles.profileImage} />
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    {isVerified && (
                      <VerifiedBadge size="small" variant="minimal" />
                    )}
                  </View>
                  <Text style={styles.category}>{worker.primary_category}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.location}>{worker.city}, {worker.locality}</Text>
                  </View>
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="star" size={18} color={COLORS.star} />
                  </View>
                  <Text style={styles.statValue}>
                    {workerRating.totalReviews > 0
                      ? workerRating.averageRating.toFixed(1)
                      : worker.rating_average.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>
                    ({workerRating.totalReviews > 0 ? workerRating.totalReviews : worker.rating_count} reviews)
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="briefcase" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statValue}>{worker.years_of_experience}</Text>
                  <Text style={styles.statLabel}>years exp</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="cash" size={18} color={COLORS.success} />
                  </View>
                  <Text style={styles.statValue}>₹{worker.daily_wage_min}</Text>
                  <Text style={styles.statLabel}>/day</Text>
                </View>
              </View>
            </View>

            {/* Verification Level & Trust Badges */}
            <View style={styles.section}>
              <View style={styles.verificationHeader}>
                <Text style={styles.sectionTitle}>Trust & Verification</Text>
                <VerificationLevelBadge
                  level={workerVerification.level}
                  label={levelBadge.label}
                  color={levelBadge.color}
                  icon={levelBadge.icon}
                  size="medium"
                />
              </View>

              <TrustMessage
                message="All badges are earned through verified work and customer reviews"
                type="shield"
              />

              <View style={styles.badgesContainer}>
                <TrustBadges badges={workerVerification.badges} />
              </View>
            </View>

            {/* Trust Score & Safety */}
            <View style={styles.section}>
              <View style={styles.trustContainer}>
                <TrustScore score={trustScore} size="large" showLabel />
                <View style={styles.trustDetails}>
                  <View style={styles.trustDetailRow}>
                    <Ionicons name="shield-checkmark" size={18} color={COLORS.verified} />
                    <Text style={styles.trustDetailText}>
                      {isVerified ? 'Verified Profile' : 'Profile Under Review'}
                    </Text>
                  </View>
                  <View style={styles.trustDetailRow}>
                    <Ionicons name="star" size={18} color={COLORS.star} />
                    <Text style={styles.trustDetailText}>
                      {worker.rating_average.toFixed(1)} ⭐ ({worker.rating_count} reviews)
                    </Text>
                  </View>
                  <View style={styles.trustDetailRow}>
                    <Ionicons name="checkmark-done" size={18} color={COLORS.success} />
                    <Text style={styles.trustDetailText}>
                      {Math.round((worker.rating_count / (worker.rating_count + 5)) * 100)}% Job Completion
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Safety Promise */}
            <View style={styles.section}>
              <SafetyPromiseCard />
            </View>

            {/* Secondary Action - Confirm Deal */}
            {isCustomerMode && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.confirmDealButton}
                  onPress={handleSendDealRequest}
                  activeOpacity={0.9}
                >
                  <View style={styles.confirmDealContent}>
                    <Ionicons name="document-text" size={22} color={COLORS.primary} />
                    <View style={styles.confirmDealText}>
                      <Text style={styles.confirmDealTitle}>Need a formal deal?</Text>
                      <Text style={styles.confirmDealSubtitle}>Send detailed job request with terms</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{worker.bio}</Text>
            </View>

            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {worker.sub_skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Work Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Availability</Text>
                  <Text style={styles.detailValue}>{worker.availability_type.replace('_', ' ')}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="language-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Languages</Text>
                  <Text style={styles.detailValue}>{worker.languages.join(', ')}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="car-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Travel</Text>
                  <Text style={styles.detailValue}>
                    {worker.travel_willingness ? `Up to ${worker.travel_radius_km} km` : 'Local only'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Rate Range</Text>
                  <Text style={styles.detailValue}>₹{worker.daily_wage_min} - ₹{worker.daily_wage_max}/day</Text>
                </View>
              </View>
            </View>

            {/* Service Area Map */}
            {worker.location && Platform.OS !== 'web' && MiniMapView && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Area</Text>
                <Text style={styles.serviceAreaText}>
                  Serves within {worker.travel_radius_km} km radius
                </Text>
                <View style={styles.mapContainer}>
                  <MiniMapView
                    location={worker.location}
                    title={`${worker.name}'s Service Area`}
                    showRadius
                    radiusKm={worker.travel_radius_km}
                    height={180}
                  />
                </View>
                <View style={styles.serviceAreaNote}>
                  <Ionicons name="information-circle" size={16} color={COLORS.info} />
                  <Text style={styles.serviceAreaNoteText}>
                    Approximate service area. Exact location shared after deal acceptance.
                  </Text>
                </View>
              </View>
            )}

            {/* Portfolio Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Portfolio</Text>
                <TouchableOpacity onPress={() => setShowGallery(true)}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {portfolioImages.slice(0, 4).map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.portfolioItem}
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setShowGallery(true);
                    }}
                  >
                    <Image source={{ uri: item.url }} style={styles.portfolioImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Customer Reviews</Text>
                <Text style={styles.reviewCount}>
                  {verifiedReviews.length > 0 ? verifiedReviews.length : workerReviews.length} reviews
                </Text>
              </View>

              {verifiedReviews.length > 0 ? (
                <>
                  <View style={styles.verifiedBanner}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.verifiedBannerText}>All reviews are from verified completed work</Text>
                  </View>

                  {verifiedReviews.map(({ deal, review }) => (
                    <View key={deal.id} style={styles.verifiedReviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.reviewerInitial}>{deal.customerName.charAt(0)}</Text>
                          </View>
                          <View>
                            <Text style={styles.reviewerName}>{deal.customerName}</Text>
                            <Text style={styles.reviewDate}>
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.verifiedWorkBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                          <Text style={styles.verifiedWorkText}>Verified Work</Text>
                        </View>
                      </View>

                      <View style={styles.reviewRating}>
                        <StarRating rating={review.rating} readonly size={18} />
                      </View>

                      {review.comment && (
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      )}

                      <View style={styles.workDetails}>
                        <Text style={styles.workDetailsLabel}>Work:</Text>
                        <Text style={styles.workDetailsText} numberOfLines={2}>{deal.problem}</Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                <>
                  <Text style={styles.reviewSubtitle}>All reviews are from verified customers</Text>
                  {workerReviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review.id} review={review} variant="full" />
                  ))}
                  {workerReviews.length > 5 && (
                    <TouchableOpacity style={styles.viewAllReviews}>
                      <Text style={styles.viewAllReviewsText}>View all {workerReviews.length} reviews</Text>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}

        {/* Premium Action Bar */}
        <WorkerProfileActionBar
          price={worker.daily_wage_min}
          priceLabel="Starting from"
          onChatPress={handleChat}
          onNotifyPress={handleNotify}
          onCallPress={handleCallNow}
          isCustomerMode={isCustomerMode}
        />

        {/* No Response Banner */}
        <NoResponseBanner
          visible={showNoResponseBanner}
          onNotifyPress={handleNotify}
        />
      </SafeAreaView>

      {/* Contact Modal */}
      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.contactModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact {worker.name}</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.workerPreview}>
              <Image source={{ uri: worker.profile_photo_url }} style={styles.modalWorkerImage} />
              <View>
                <Text style={styles.modalWorkerName}>{worker.name}</Text>
                <Text style={styles.modalWorkerCategory}>{worker.primary_category}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.contactOption} onPress={handleStartChat}>
              <View style={[styles.contactIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Start Chat</Text>
                <Text style={styles.contactSubtitle}>Message directly in the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption}>
              <View style={[styles.contactIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="call" size={24} color={COLORS.success} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Request Call</Text>
                <Text style={styles.contactSubtitle}>Worker will call you back</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Quick Notify Option */}
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => {
                setShowContactModal(false);
                // Open deal request modal with quick notify mode
                handleSendDealRequest();
              }}
            >
              <View style={[styles.contactIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="notifications" size={24} color={COLORS.warning} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Send Quick Request</Text>
                <Text style={styles.contactSubtitle}>Notify worker with your job details</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              Phone numbers are shared only after mutual agreement
            </Text>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => {
                setShowContactModal(false);
                handleReportUser();
              }}
            >
              <Ionicons name="flag" size={20} color={COLORS.error} />
              <Text style={styles.reportText}>Report this user</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deal Request Modal */}
      <DealRequestModal
        visible={showDealRequestModal}
        worker={worker}
        onClose={() => setShowDealRequestModal(false)}
        onSuccess={handleDealRequestSuccess}
      />

      {/* Report User Modal */}
      <ReportUserModal
        visible={showReportModal}
        userId={worker.id}
        userName={worker.name}
        onClose={() => setShowReportModal(false)}
        onReport={handleReportSubmit}
      />

      {/* Notify Worker Modal */}
      <NotifyWorkerModal
        visible={showNotifyModal}
        workerId={worker.id}
        workerName={worker.name}
        defaultLocation={userLocation?.city || ''}
        onClose={() => setShowNotifyModal(false)}
        onSubmit={handleNotifySubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerImage: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerActions: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.base,
    right: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
  },
  profileSection: {
    backgroundColor: COLORS.white,
    marginTop: -40,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: COLORS.verified,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  category: {
    fontSize: FONT_SIZES.base,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderLight,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.sm,
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
    marginBottom: SPACING.md,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  trustDetails: {
    flex: 1,
    gap: SPACING.sm,
  },
  trustDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trustDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  reviewSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  viewAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  viewAllReviewsText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  aboutText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skillChip: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  skillText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  serviceAreaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  mapContainer: {
    marginBottom: SPACING.md,
  },
  serviceAreaNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  serviceAreaNoteText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
    lineHeight: 18,
  },
  portfolioItem: {
    marginRight: SPACING.sm,
  },
  portfolioImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.borderLight,
  },
  reviewCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  reviewCard: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  reviewerInitial: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  priceInfo: {},
  priceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  dealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  dealButtonWide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  dealButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contactModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['2xl'],
    borderTopRightRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  workerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  modalWorkerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  modalWorkerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalWorkerCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  privacyNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  reportText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  verifiedBannerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  verifiedReviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  verifiedWorkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  verifiedWorkText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  reviewRating: {
    marginVertical: SPACING.sm,
  },
  workDetails: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  workDetailsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  workDetailsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgesContainer: {
    marginTop: SPACING.md,
  },
  confirmDealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  confirmDealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  confirmDealText: {
    flex: 1,
  },
  confirmDealTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  confirmDealSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
