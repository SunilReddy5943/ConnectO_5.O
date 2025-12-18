/**
 * Location Context
 * Manages user location state and provides location services
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserLocation,
  getCurrentLocation,
  requestLocationPermission,
  DEFAULT_LOCATIONS,
} from '../lib/locationService';

interface LocationContextType {
  userLocation: UserLocation | null;
  isLoading: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  updateLocation: () => Promise<void>;
  setManualLocation: (location: UserLocation) => Promise<void>;
  getNearbyRadius: () => number;
  setNearbyRadius: (radius: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LOCATION: '@connecto_user_location',
  PERMISSION: '@connecto_location_permission',
  NEARBY_RADIUS: '@connecto_nearby_radius',
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [nearbyRadius, setNearbyRadiusState] = useState(5); // Default 5km

  // Load saved location and permission on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      setIsLoading(true);

      // Load saved location
      const savedLocation = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
        setIsLoading(false);
      } else {
        // No saved location - try to get actual GPS location
        console.log('No saved location, attempting to fetch GPS location...');
        
        // Check if we have permission
        const savedPermission = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION);
        const hadPermission = savedPermission === 'true';
        
        if (hadPermission) {
          // Try to fetch location automatically
          const location = await getCurrentLocation();
          if (location) {
            setUserLocation(location);
            await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
            setPermissionGranted(true);
          } else {
            // Fallback to default only if GPS fails
            console.log('GPS fetch failed, using default Mumbai location');
            setUserLocation(DEFAULT_LOCATIONS.mumbai);
          }
        } else {
          // No permission yet - use default but don't save it
          // This way, next time permission is granted, we'll fetch real location
          console.log('No location permission, using temporary default');
          setUserLocation(DEFAULT_LOCATIONS.mumbai);
        }
        setIsLoading(false);
      }

      // Load permission status
      const savedPermission = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION);
      if (savedPermission) {
        setPermissionGranted(savedPermission === 'true');
      }

      // Load nearby radius
      const savedRadius = await AsyncStorage.getItem(STORAGE_KEYS.NEARBY_RADIUS);
      if (savedRadius) {
        setNearbyRadiusState(parseInt(savedRadius, 10));
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      // Fallback to default
      setUserLocation(DEFAULT_LOCATIONS.mumbai);
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { granted } = await requestLocationPermission();
      setPermissionGranted(granted);
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION, granted.toString());

      if (granted) {
        // Fetch current location
        await updateLocation();
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const updateLocation = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();

      if (location) {
        setUserLocation(location);
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
      }
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = async (location: UserLocation): Promise<void> => {
    try {
      setUserLocation(location);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Error setting manual location:', error);
    }
  };

  const getNearbyRadius = (): number => {
    return nearbyRadius;
  };

  const setNearbyRadius = async (radius: number): Promise<void> => {
    try {
      setNearbyRadiusState(radius);
      await AsyncStorage.setItem(STORAGE_KEYS.NEARBY_RADIUS, radius.toString());
    } catch (error) {
      console.error('Error setting nearby radius:', error);
    }
  };

  const value: LocationContextType = {
    userLocation,
    isLoading,
    permissionGranted,
    requestPermission,
    updateLocation,
    setManualLocation,
    getNearbyRadius,
    setNearbyRadius,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
