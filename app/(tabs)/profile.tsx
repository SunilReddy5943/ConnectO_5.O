import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useAdmin } from '../context/AdminContext';
import RoleSwitcher from '../components/RoleSwitcher';
import ModeSwitchButton from '../components/role/ModeSwitchButton';
import RoleSwitchModal from '../components/role/RoleSwitchModal';
import ModeTransitionOverlay from '../components/role/ModeTransitionOverlay';
import { APP_VERSION } from '../config/featureFlags';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
  color?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, activeRole, hasRole, switchRole } = useAuth();
  const { savedWorkers, unreadCount } = useApp();
  const { isAdmin, getUnreviewedReportsCount } = useAdmin();

  const isWorkerMode = activeRole === 'WORKER';

  // Role switch state
  const [showRoleSwitchModal, setShowRoleSwitchModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Animation for referral card
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAuthenticated) {
      // Animate in when authenticated
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250, // Limit to <300ms for performance
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleSwitchRolePress = () => {
    setShowRoleSwitchModal(true);
  };

  const handleConfirmSwitch = async () => {
    setIsSwitchingRole(true);
    const targetRole = activeRole === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER';

    try {
      await switchRole(targetRole);
      setShowRoleSwitchModal(false);
      setIsTransitioning(true);
    } catch (error: any) {
      setIsSwitchingRole(false);
      Alert.alert('Cannot Switch', error.message || 'Failed to switch role');
    }
  };

  const handleCancelSwitch = () => {
    setShowRoleSwitchModal(false);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setIsSwitchingRole(false);
    // Show toast
    Alert.alert(
      'Mode Switched',
      `You're now in ${activeRole} mode`,
      [{ text: 'OK' }]
    );
  };


  const menuItems: MenuItem[] = [
    // Admin Panel - Only for admins
    ...(isAdmin ? [{
      id: 'admin',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      title: 'Admin Panel',
      subtitle: `${getUnreviewedReportsCount()} reports pending`,
      onPress: () => router.push('/admin' as any),
      color: COLORS.error,
      showBadge: getUnreviewedReportsCount() > 0,
      badgeCount: getUnreviewedReportsCount(),
    }] : []),
    ...(isWorkerMode ? [{
      id: 'earnings',
      icon: 'analytics' as keyof typeof Ionicons.glyphMap,
      title: 'Earnings & Analytics',
      subtitle: 'Track your growth and insights',
      onPress: () => router.push('/(tabs)/earnings'),
      color: COLORS.secondary,
    }] : []),
    // Become a Worker removed - now shown as prominent banner
    {
      id: 'saved',
      icon: 'heart',
      title: 'Saved Workers',
      subtitle: `${savedWorkers.length} workers saved`,
      onPress: () => router.push('/saved'),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notifications',
      onPress: () => router.push('/notifications'),
      showBadge: unreadCount > 0,
      badgeCount: unreadCount,
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Settings',
      onPress: () => { },
    },
    {
      id: 'about',
      icon: 'information-circle',
      title: 'About & Support',
      onPress: () => router.push('/about'),
    },
    {
      id: 'feedback',
      icon: 'chatbubble-ellipses',
      title: 'Feedback & Suggestions',
      subtitle: 'Help us improve ConnectO',
      onPress: () => router.push('/feedback'),
      color: '#8B5CF6',
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, item.color && { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={22} color={item.color || COLORS.primary} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
      </View>
      {item.showBadge && item.badgeCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badgeCount}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="person-circle" size={80} color={COLORS.textMuted} />
          </View>
          <Text style={styles.guestTitle}>Welcome to ConnectO</Text>
          <Text style={styles.guestSubtitle}>
            Login to access your profile, saved workers, and more
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guestMenu}>
          {menuItems.slice(3).map(renderMenuItem)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.activeRole === 'WORKER' ? 'construct' : 'person'}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.roleText}>
              {user?.activeRole === 'WORKER' ? 'Worker' : 'Customer'}
            </Text>
          </View>
        </View>

        {/* Role Switcher - Only show if user has both roles, hidden below settings */}
        {user?.roles && user.roles.length > 1 && (
          <View style={styles.roleSwitcherSection}>
            <Text style={styles.roleSwitcherLabel}>Switch App Experience</Text>
            <Text style={styles.roleSwitcherSubtext}>
              You have {user.roles.length} roles. The app will remember your last choice.
            </Text>
            <ModeSwitchButton
              variant="pill"
              position="inline"
              onPress={handleSwitchRolePress}
            />
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedWorkers.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Become a Worker Banner - Only for customers without WORKER role */}
        {!hasRole('WORKER') && activeRole === 'CUSTOMER' && (
          <TouchableOpacity
            style={styles.workerBanner}
            onPress={() => router.push('/auth/worker-register')}
            activeOpacity={0.9}
          >
            <View style={styles.workerBannerContent}>
              <View style={styles.workerBannerIcon}>
                <Ionicons name="construct" size={28} color={COLORS.secondary} />
              </View>
              <View style={styles.workerBannerText}>
                <Text style={styles.workerBannerTitle}>Want to earn on ConnectO?</Text>
                <Text style={styles.workerBannerSubtitle}>Join as a worker and start getting jobs</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Refer & Earn Card - Above Logout */}
        <Animated.View
          style={[
            styles.referralCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/referral' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.referralContent}>
              <View style={styles.referralTextSection}>
                <Text style={styles.referralTitle}>Refer & earn ₹100</Text>
                <Text style={styles.referralSubtitle}>
                  Get ₹100 when your friend completes their first booking
                </Text>
                <TouchableOpacity
                  style={styles.referNowButton}
                  onPress={() => router.push('/referral' as any)}
                >
                  <Text style={styles.referNowText}>Refer now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.referralIconContainer}>
                <Ionicons name="gift" size={56} color="#F97316" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>ConnectO v{APP_VERSION.VERSION} ({APP_VERSION.ENVIRONMENT})</Text>
      </ScrollView>

      {/* Role Switch Modal */}
      <RoleSwitchModal
        visible={showRoleSwitchModal}
        currentRole={(activeRole === 'ADMIN' ? 'CUSTOMER' : activeRole) || 'CUSTOMER'}
        targetRole={activeRole === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER'}
        isLoading={isSwitchingRole}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />

      {/* Mode Transition Overlay */}
      <ModeTransitionOverlay
        visible={isTransitioning}
        targetRole={(activeRole === 'ADMIN' ? 'CUSTOMER' : activeRole) || 'CUSTOMER'}
        onComplete={handleTransitionComplete}
      />
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
  editButton: {
    padding: SPACING.sm,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderLight,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  roleSwitcherSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  roleSwitcherLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  roleSwitcherSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  guestContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  guestIconContainer: {
    marginBottom: SPACING.md,
  },
  guestTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  guestSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  guestMenu: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  referralCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#E9D5FF',
    ...SHADOWS.md,
  },
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralTextSection: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  referralTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  referralSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  referNowButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  referNowText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  referralIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerBanner: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    ...SHADOWS.sm,
  },
  workerBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    gap: SPACING.md,
  },
  workerBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerBannerText: {
    flex: 1,
  },
  workerBannerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  workerBannerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
