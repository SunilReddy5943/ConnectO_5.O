/**
 * Location Service
 * Handles location permissions, geolocation, and distance calculations
 */

import * as Location from 'expo-location';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCbLaTG4dYB53C9uKqtt0W1EJqsnnr4NW4';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends LocationCoordinates {
  city: string;
  area: string;
  country: string;
}

/**
 * Request location permissions from the user
 * @returns Permission status
 */
export async function requestLocationPermission(): Promise<{
  granted: boolean;
  status: Location.PermissionStatus;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      granted: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
}

/**
 * Check if location permissions are granted
 * @returns Permission status
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get current user location with city/area details
 * @returns User location data
 */
export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      const { granted } = await requestLocationPermission();
      if (!granted) {
        return null;
      }
    }

    console.log('Fetching GPS coordinates...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    console.log(`GPS coordinates: ${latitude}, ${longitude}`);

    // Try Google Geocoding API first for better accuracy
    try {
      console.log('Using Google Geocoding API for reverse geocoding...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let area = '';
        let country = 'India';
        let state = '';
        
        // Parse address components
        for (const component of addressComponents) {
          const types = component.types;
          
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            area = component.long_name;
          } else if (types.includes('administrative_area_level_2') && !city) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        }
        
        // If no area found, use neighborhood or political area
        if (!area) {
          for (const component of addressComponents) {
            if (component.types.includes('neighborhood') || component.types.includes('political')) {
              area = component.long_name;
              break;
            }
          }
        }
        
        console.log(`Google Geocoding result: ${city}, ${area}, ${state}, ${country}`);
        
        return {
          latitude,
          longitude,
          city: city || 'Unknown',
          area: area || city || '',
          country,
        };
      }
    } catch (geocodingError) {
      console.log('Google Geocoding failed, falling back to expo-location:', geocodingError);
    }

    // Fallback to expo-location's reverse geocoding
    console.log('Using expo-location reverse geocoding as fallback...');
    const [geocode] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    console.log('Expo reverse geocoding result:', geocode);

    return {
      latitude,
      longitude,
      city: geocode?.city || geocode?.subregion || 'Unknown',
      area: geocode?.district || geocode?.street || geocode?.name || '',
      country: geocode?.country || 'India',
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }
  return `${distance.toFixed(1)} km away`;
}

/**
 * Sort items by distance from a reference point
 * @param items Array of items with location coordinates
 * @param userLocation User's current location
 * @returns Sorted array with distance property added
 */
export function sortByDistance<T extends { location: LocationCoordinates }>(
  items: T[],
  userLocation: LocationCoordinates
): Array<T & { distance: number }> {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLocation, item.location),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter items within a certain radius
 * @param items Array of items with location coordinates
 * @param userLocation User's current location
 * @param radiusKm Radius in kilometers
 * @returns Filtered array with items within radius
 */
export function filterByRadius<T extends { location: LocationCoordinates }>(
  items: T[],
  userLocation: LocationCoordinates,
  radiusKm: number
): Array<T & { distance: number }> {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLocation, item.location),
    }))
    .filter((item) => item.distance <= radiusKm);
}

/**
 * Default locations for fallback when permission denied
 */
export const DEFAULT_LOCATIONS = {
  mumbai: {
    latitude: 19.0760,
    longitude: 72.8777,
    city: 'Mumbai',
    area: 'Andheri',
    country: 'India',
  },
  delhi: {
    latitude: 28.7041,
    longitude: 77.1025,
    city: 'Delhi',
    area: 'Connaught Place',
    country: 'India',
  },
  bangalore: {
    latitude: 12.9716,
    longitude: 77.5946,
    city: 'Bangalore',
    area: 'Koramangala',
    country: 'India',
  },
  hyderabad: {
    latitude: 17.3850,
    longitude: 78.4867,
    city: 'Hyderabad',
    area: 'Banjara Hills',
    country: 'India',
  },
  chennai: {
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    area: 'T. Nagar',
    country: 'India',
  },
};

/**
 * Get coordinates for a city name
 */
export function getCityCoordinates(cityName: string): UserLocation | null {
  const normalizedCity = cityName.toLowerCase();
  
  if (normalizedCity.includes('mumbai')) {
    return DEFAULT_LOCATIONS.mumbai;
  } else if (normalizedCity.includes('delhi')) {
    return DEFAULT_LOCATIONS.delhi;
  } else if (normalizedCity.includes('bangalore') || normalizedCity.includes('bengaluru')) {
    return DEFAULT_LOCATIONS.bangalore;
  } else if (normalizedCity.includes('hyderabad')) {
    return DEFAULT_LOCATIONS.hyderabad;
  } else if (normalizedCity.includes('chennai')) {
    return DEFAULT_LOCATIONS.chennai;
  }
  
  return null;
}
