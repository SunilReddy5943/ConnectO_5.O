/**
 * Profile Repository
 * ==================
 * Supabase integration for profile CRUD operations.
 * Handles both Customer and Worker profile data.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import {
    CustomerProfile,
    CustomerProfileUpdate,
    WorkerProfile,
    WorkerProfileUpdate,
    ProfileResponse,
    Location,
    NotificationSettings,
    PROFILE_VALIDATION,
} from './profileTypes';

// =============================================
// CONSTANTS
// =============================================

const STORAGE_BUCKET = 'profile-photos';

// =============================================
// IMAGE HANDLING
// =============================================

/**
 * Compress and upload profile photo
 */
export const uploadProfilePhoto = async (
    uri: string,
    userId: string
): Promise<string | null> => {
    try {
        // Compress image
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 500, height: 500 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Generate filename
        const filename = `${userId}/${Date.now()}.jpg`;

        // Fetch as blob
        const response = await fetch(result.uri);
        const blob = await response.blob();

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, blob, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading photo:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filename);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error in uploadProfilePhoto:', error);
        return null;
    }
};

// =============================================
// CUSTOMER PROFILE
// =============================================

/**
 * Get customer profile
 */
export const getCustomerProfile = async (
    userId: string
): Promise<ProfileResponse<CustomerProfile>> => {
    try {
        // Get user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            return { success: false, error: 'Failed to fetch profile' };
        }

        // Get customer preferences (if exists)
        const { data: prefs } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        const profile: CustomerProfile = {
            userId: user.id,
            fullName: user.name,
            phone: user.phone,
            email: user.email || '',
            profilePhotoUrl: user.profile_photo_url,
            location: {
                city: prefs?.city || 'Mumbai',
                area: prefs?.area || '',
                latitude: prefs?.latitude,
                longitude: prefs?.longitude,
            },
            preferredServiceTime: prefs?.preferred_service_time || 'ANYTIME',
            language: prefs?.language || 'English',
            notificationSettings: prefs?.notification_settings || {
                pushEnabled: true,
                smsEnabled: true,
                emailEnabled: false,
                marketingEnabled: false,
            },
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };

        return { success: true, data: profile };
    } catch (error) {
        console.error('Error in getCustomerProfile:', error);
        return { success: false, error: 'An error occurred' };
    }
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (
    userId: string,
    updates: CustomerProfileUpdate
): Promise<ProfileResponse<CustomerProfile>> => {
    try {
        // Validate
        if (updates.fullName && updates.fullName.length < PROFILE_VALIDATION.NAME_MIN_LENGTH) {
            return { success: false, error: 'Name is too short' };
        }

        if (updates.email && !PROFILE_VALIDATION.EMAIL_REGEX.test(updates.email)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Update users table
        const userUpdates: any = {};
        if (updates.fullName) userUpdates.name = updates.fullName;
        if (updates.email !== undefined) userUpdates.email = updates.email;
        if (updates.profilePhotoUrl) userUpdates.profile_photo_url = updates.profilePhotoUrl;

        if (Object.keys(userUpdates).length > 0) {
            const { error } = await supabase
                .from('users')
                .update(userUpdates)
                .eq('id', userId);

            if (error) {
                console.error('Error updating user:', error);
                return { success: false, error: 'Failed to update profile' };
            }
        }

        // Update customer_profiles table
        const prefUpdates: any = {
            user_id: userId,
            updated_at: new Date().toISOString(),
        };

        if (updates.location) {
            if (updates.location.city) prefUpdates.city = updates.location.city;
            if (updates.location.area) prefUpdates.area = updates.location.area;
            if (updates.location.latitude) prefUpdates.latitude = updates.location.latitude;
            if (updates.location.longitude) prefUpdates.longitude = updates.location.longitude;
        }

        if (updates.preferredServiceTime) {
            prefUpdates.preferred_service_time = updates.preferredServiceTime;
        }

        if (updates.language) {
            prefUpdates.language = updates.language;
        }

        if (updates.notificationSettings) {
            prefUpdates.notification_settings = updates.notificationSettings;
        }

        // Upsert preferences
        const { error: prefError } = await supabase
            .from('customer_profiles')
            .upsert(prefUpdates, { onConflict: 'user_id' });

        if (prefError) {
            console.warn('Error updating preferences:', prefError.message);
            // Continue anyway - main user data is updated
        }

        // Return updated profile
        return getCustomerProfile(userId);
    } catch (error) {
        console.error('Error in updateCustomerProfile:', error);
        return { success: false, error: 'An error occurred' };
    }
};

// =============================================
// WORKER PROFILE
// =============================================

/**
 * Get worker profile
 */
export const getWorkerProfile = async (
    userId: string
): Promise<ProfileResponse<WorkerProfile>> => {
    try {
        // Get user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            return { success: false, error: 'Failed to fetch profile' };
        }

        // Get worker data
        const { data: worker } = await supabase
            .from('workers')
            .select('*')
            .eq('user_id', userId)
            .single();

        const profile: WorkerProfile = {
            userId: user.id,
            fullName: user.name,
            phone: user.phone,
            email: user.email || '',
            profilePhotoUrl: user.profile_photo_url,
            primarySkill: worker?.category || '',
            subSkills: worker?.skills || [],
            yearsOfExperience: worker?.experience_years || 0,
            bio: worker?.bio || '',
            availability: {
                availableToday: worker?.availability_status === 'AVAILABLE',
                workingHoursStart: worker?.working_hours_start || '09:00',
                workingHoursEnd: worker?.working_hours_end || '18:00',
                daysAvailable: worker?.days_available || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            },
            baseLocation: {
                city: worker?.city || 'Mumbai',
                area: worker?.address || '',
                latitude: worker?.location_lat,
                longitude: worker?.location_lng,
            },
            serviceRadiusKm: worker?.service_radius || 10,
            pricing: worker?.hourly_rate ? {
                startingPrice: worker.hourly_rate,
                priceType: worker.price_type || 'DAILY',
            } : undefined,
            verificationStatus: worker?.verification_status || 'UNVERIFIED',
            idDocumentUrl: worker?.id_document_url,
            ratingAverage: worker?.rating_average || 0,
            ratingCount: worker?.rating_count || 0,
            totalCompletedWorks: worker?.total_completed_works || 0,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };

        return { success: true, data: profile };
    } catch (error) {
        console.error('Error in getWorkerProfile:', error);
        return { success: false, error: 'An error occurred' };
    }
};

/**
 * Update worker profile
 */
export const updateWorkerProfile = async (
    userId: string,
    updates: WorkerProfileUpdate
): Promise<ProfileResponse<WorkerProfile>> => {
    try {
        // Validate
        if (updates.fullName && updates.fullName.length < PROFILE_VALIDATION.NAME_MIN_LENGTH) {
            return { success: false, error: 'Name is too short' };
        }

        if (updates.bio && updates.bio.length > PROFILE_VALIDATION.BIO_MAX_LENGTH) {
            return { success: false, error: `Bio must be under ${PROFILE_VALIDATION.BIO_MAX_LENGTH} characters` };
        }

        if (updates.serviceRadiusKm) {
            if (updates.serviceRadiusKm < PROFILE_VALIDATION.SERVICE_RADIUS_MIN ||
                updates.serviceRadiusKm > PROFILE_VALIDATION.SERVICE_RADIUS_MAX) {
                return { success: false, error: 'Invalid service radius' };
            }
        }

        // Update users table
        const userUpdates: any = {};
        if (updates.fullName) userUpdates.name = updates.fullName;
        if (updates.email !== undefined) userUpdates.email = updates.email;
        if (updates.profilePhotoUrl) userUpdates.profile_photo_url = updates.profilePhotoUrl;

        if (Object.keys(userUpdates).length > 0) {
            const { error } = await supabase
                .from('users')
                .update(userUpdates)
                .eq('id', userId);

            if (error) {
                console.error('Error updating user:', error);
                return { success: false, error: 'Failed to update profile' };
            }
        }

        // Update workers table
        const workerUpdates: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.primarySkill) workerUpdates.category = updates.primarySkill;
        if (updates.subSkills) workerUpdates.skills = updates.subSkills;
        if (updates.yearsOfExperience !== undefined) workerUpdates.experience_years = updates.yearsOfExperience;
        if (updates.bio !== undefined) workerUpdates.bio = updates.bio;

        if (updates.availability) {
            if (updates.availability.availableToday !== undefined) {
                workerUpdates.availability_status = updates.availability.availableToday ? 'AVAILABLE' : 'BUSY';
            }
            if (updates.availability.workingHoursStart) {
                workerUpdates.working_hours_start = updates.availability.workingHoursStart;
            }
            if (updates.availability.workingHoursEnd) {
                workerUpdates.working_hours_end = updates.availability.workingHoursEnd;
            }
            if (updates.availability.daysAvailable) {
                workerUpdates.days_available = updates.availability.daysAvailable;
            }
        }

        if (updates.baseLocation) {
            if (updates.baseLocation.city) workerUpdates.city = updates.baseLocation.city;
            if (updates.baseLocation.area) workerUpdates.address = updates.baseLocation.area;
            if (updates.baseLocation.latitude) workerUpdates.location_lat = updates.baseLocation.latitude;
            if (updates.baseLocation.longitude) workerUpdates.location_lng = updates.baseLocation.longitude;
        }

        if (updates.serviceRadiusKm) workerUpdates.service_radius = updates.serviceRadiusKm;

        if (updates.pricing) {
            if (updates.pricing.startingPrice) workerUpdates.hourly_rate = updates.pricing.startingPrice;
            if (updates.pricing.priceType) workerUpdates.price_type = updates.pricing.priceType;
        }

        // Update worker record
        const { error: workerError } = await supabase
            .from('workers')
            .update(workerUpdates)
            .eq('user_id', userId);

        if (workerError) {
            console.warn('Error updating worker:', workerError.message);
        }

        // Return updated profile
        return getWorkerProfile(userId);
    } catch (error) {
        console.error('Error in updateWorkerProfile:', error);
        return { success: false, error: 'An error occurred' };
    }
};
