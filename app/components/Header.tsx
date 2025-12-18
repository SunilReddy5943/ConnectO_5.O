import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLocation } from '../context/LocationContext';
import BusyModeToggle from './BusyModeToggle';
import { DEFAULT_LOCATIONS } from '../lib/locationService';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  showLocation?: boolean;
  location?: string;
  transparent?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  showBack = false,
  showProfile = true,
  showNotifications = true,
  showLocation = false,
  location,
  transparent = false,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const { user, activeRole } = useAuth();
  const { unreadCount } = useApp();
  const { userLocation, isLoading, requestPermission, setManualLocation } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const isWorkerMode = activeRole === 'WORKER';

  // Use location from context if not provided
  const displayLocation = location || (userLocation ? `${userLocation.city}, ${userLocation.country}` : 'Select Location');

  const handleBack = () => {
    router.back();
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleLocationPress = () => {
    setShowLocationModal(true);
  };

  const handleSelectLocation = async (cityKey: keyof typeof DEFAULT_LOCATIONS) => {
    const selectedLocation = DEFAULT_LOCATIONS[cityKey];
    await setManualLocation(selectedLocation);
    setShowLocationModal(false);
  };

  const handleUseCurrentLocation = async () => {
    setShowLocationModal(false);
    const granted = await requestPermission();
    if (!granted) {
      alert('Location permission denied. Please enable location access in settings.');
    }
  };

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : showLocation ? (
          <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Your Location</Text>
              <View style={styles.locationRow}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Text style={styles.locationValue} numberOfLines={1}>{displayLocation}</Text>
                    <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ) : null}
        
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightAction}
        
        {/* Busy Mode Toggle - Worker Only */}
        {isWorkerMode && <BusyModeToggle compact />}
        
        {showNotifications && (
          <TouchableOpacity onPress={handleNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* City Selector Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your City</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="navigate" size={20} color={COLORS.primary} />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            <ScrollView style={styles.cityList}>
              {Object.entries(DEFAULT_LOCATIONS).map(([key, loc]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.cityItem}
                  onPress={() => handleSelectLocation(key as keyof typeof DEFAULT_LOCATIONS)}
                >
                  <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.cityName}>{loc.city}</Text>
                  {userLocation?.city === loc.city && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: SPACING.sm,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 150,
  },
  iconButton: {
    padding: SPACING.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileButton: {
    marginLeft: SPACING.sm,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.base,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  currentLocationText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cityList: {
    marginTop: SPACING.sm,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  cityName: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    flex: 1,
  },
});
