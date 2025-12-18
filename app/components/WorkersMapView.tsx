/**
 * Workers Map View Component
 * Displays workers on a map with pins and worker preview cards
 * NOTE: This component only works on iOS/Android, not on web
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DummyWorker } from '../data/dummyWorkers';
import { UserLocation } from '../lib/locationService';

// Only import react-native-maps on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface WorkersMapViewProps {
  workers: DummyWorker[];
  userLocation: UserLocation | null;
  isLoading?: boolean;
}

export default function WorkersMapView({ workers, userLocation, isLoading = false }: WorkersMapViewProps) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedWorker, setSelectedWorker] = useState<DummyWorker | null>(null);

  // Web platform fallback
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="map-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.loadingText}>Map view is only available on mobile apps</Text>
        <Text style={[styles.loadingText, { fontSize: FONT_SIZES.sm, marginTop: SPACING.xs }]}>
          Please switch to list view or use the mobile app
        </Text>
      </View>
    );
  }

  // Default to Mumbai if no user location
  const initialRegion = {
    latitude: userLocation?.latitude || 19.0760,
    longitude: userLocation?.longitude || 72.8777,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const handleMarkerPress = (worker: DummyWorker) => {
    setSelectedWorker(worker);
  };

  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  };

  const handleViewProfile = (workerId: string) => {
    router.push(`/worker/${workerId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={16} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Worker Markers */}
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            coordinate={{
              latitude: worker.location.latitude,
              longitude: worker.location.longitude,
            }}
            onPress={() => handleMarkerPress(worker)}
          >
            <View style={[
              styles.workerMarker,
              worker.kyc_status === 'VERIFIED' && styles.verifiedMarker,
              selectedWorker?.id === worker.id && styles.selectedMarker,
            ]}>
              <Ionicons 
                name={worker.kyc_status === 'VERIFIED' ? 'checkmark-circle' : 'person'} 
                size={16} 
                color={COLORS.white} 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Worker Preview Card */}
      {selectedWorker && (
        <View style={styles.previewCard}>
          <TouchableOpacity
            style={styles.previewContent}
            onPress={() => handleViewProfile(selectedWorker.id)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: selectedWorker.profile_photo_url }} 
              style={styles.previewImage} 
            />
            <View style={styles.previewInfo}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {selectedWorker.name}
                </Text>
                {selectedWorker.kyc_status === 'VERIFIED' && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.verified} />
                  </View>
                )}
              </View>
              <Text style={styles.previewCategory} numberOfLines={1}>
                {selectedWorker.primary_category}
              </Text>
              <View style={styles.previewRating}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.previewRatingText}>
                  {selectedWorker.rating_average} ({selectedWorker.rating_count})
                </Text>
              </View>
              <Text style={styles.previewPrice}>
                ₹{selectedWorker.daily_wage_min} - ₹{selectedWorker.daily_wage_max}/day
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closePreview}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedWorker(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.viewProfileButton}
            onPress={() => handleViewProfile(selectedWorker.id)}
          >
            <Text style={styles.viewProfileText}>View Full Profile</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  workerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  verifiedMarker: {
    backgroundColor: COLORS.verified,
  },
  selectedMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  recenterButton: {
    position: 'absolute',
    top: SPACING.base,
    right: SPACING.base,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  previewCard: {
    position: 'absolute',
    bottom: SPACING.base,
    left: SPACING.base,
    right: SPACING.base,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
  },
  previewContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  previewInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewRatingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  previewPrice: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  closePreview: {
    padding: SPACING.xs,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  viewProfileText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});
