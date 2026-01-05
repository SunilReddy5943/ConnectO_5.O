/**
 * Feedback Repository
 * ===================
 * Supabase integration for the User Feedback & Feature Request System.
 * Handles submission, retrieval, rate limiting, and image uploads.
 */

import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
    Feedback,
    FeedbackType,
    FeedbackStatus,
    CreateFeedbackDTO,
    FeedbackSubmitResponse,
    FeedbackListResponse,
    DeviceInfo,
    RATE_LIMIT,
    VALIDATION,
} from './feedbackTypes';
import { APP_VERSION } from '../config/featureFlags';

// =============================================
// CONSTANTS
// =============================================

const RATE_LIMIT_KEY = 'feedback_submissions';
const STORAGE_BUCKET = 'feedback-screenshots';

// =============================================
// HELPERS
// =============================================

/**
 * Get device information for feedback context
 */
const getDeviceInfo = (): DeviceInfo => {
    return {
        platform: Platform.OS as 'ios' | 'android' | 'web',
        osVersion: Platform.Version?.toString(),
        // Additional device info can be added with expo-device if needed
    };
};

/**
 * Sanitize user input to prevent XSS and clean up text
 */
const sanitizeInput = (text: string): string => {
    return text
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .slice(0, VALIDATION.MESSAGE_MAX_LENGTH);
};

/**
 * Check if user is within rate limits
 * Returns { allowed: boolean, remaining: number, resetTime: Date | null }
 */
const checkRateLimit = async (): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date | null;
}> => {
    try {
        const stored = await AsyncStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        let submissions: number[] = [];

        if (stored) {
            submissions = JSON.parse(stored);
            // Filter out submissions older than 1 hour
            submissions = submissions.filter((timestamp: number) => timestamp > oneHourAgo);
        }

        const remaining = RATE_LIMIT.MAX_SUBMISSIONS_PER_HOUR - submissions.length;
        const allowed = remaining > 0;

        // Calculate when the oldest submission will expire
        let resetTime: Date | null = null;
        if (!allowed && submissions.length > 0) {
            const oldestSubmission = Math.min(...submissions);
            resetTime = new Date(oldestSubmission + (60 * 60 * 1000));
        }

        return { allowed, remaining, resetTime };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        // Allow submission if we can't check rate limit
        return { allowed: true, remaining: RATE_LIMIT.MAX_SUBMISSIONS_PER_HOUR, resetTime: null };
    }
};

/**
 * Record a new submission for rate limiting
 */
const recordSubmission = async (): Promise<void> => {
    try {
        const stored = await AsyncStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        let submissions: number[] = [];

        if (stored) {
            submissions = JSON.parse(stored);
            submissions = submissions.filter((timestamp: number) => timestamp > oneHourAgo);
        }

        submissions.push(now);
        await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(submissions));
    } catch (error) {
        console.error('Error recording submission:', error);
    }
};

/**
 * Compress image to reduce upload size
 */
const compressImage = async (uri: string): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }], // Max width 1200px
            {
                compress: 0.7, // 70% quality
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );
        return result.uri;
    } catch (error) {
        console.error('Error compressing image:', error);
        return uri; // Return original if compression fails
    }
};

/**
 * Upload screenshot to Supabase Storage
 */
const uploadScreenshot = async (
    uri: string,
    userId: string
): Promise<string | null> => {
    try {
        // Compress image first
        const compressedUri = await compressImage(uri);

        // Generate unique filename
        const filename = `${userId}/${Date.now()}.jpg`;

        // Fetch the image as blob
        const response = await fetch(compressedUri);
        const blob = await response.blob();

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading screenshot:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filename);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error in uploadScreenshot:', error);
        return null;
    }
};

// =============================================
// MAIN REPOSITORY FUNCTIONS
// =============================================

/**
 * Submit new feedback
 */
export const submitFeedback = async (
    dto: CreateFeedbackDTO,
    userId: string,
    userRole: 'CUSTOMER' | 'WORKER'
): Promise<FeedbackSubmitResponse> => {
    try {
        // Check rate limit
        const { allowed, remaining, resetTime } = await checkRateLimit();

        if (!allowed) {
            return {
                success: false,
                error: RATE_LIMIT.COOLDOWN_MESSAGE,
                rateLimited: true,
            };
        }

        // Validate message
        const sanitizedMessage = sanitizeInput(dto.message);

        if (sanitizedMessage.length < VALIDATION.MESSAGE_MIN_LENGTH) {
            return {
                success: false,
                error: `Message must be at least ${VALIDATION.MESSAGE_MIN_LENGTH} characters.`,
            };
        }

        // Upload screenshot if provided
        let screenshotUrl: string | null = null;
        if (dto.screenshotUri) {
            screenshotUrl = await uploadScreenshot(dto.screenshotUri, userId);
        }

        // Prepare feedback data
        const feedbackData = {
            user_id: userId,
            user_role: userRole,
            feedback_type: dto.feedbackType,
            message: sanitizedMessage,
            rating: dto.rating || null,
            screenshot_url: screenshotUrl,
            app_version: APP_VERSION.VERSION,
            device_info: getDeviceInfo(),
            status: FeedbackStatus.NEW,
        };

        // Insert into database
        const { data, error } = await supabase
            .from('feedback')
            .insert(feedbackData)
            .select('id')
            .single();

        if (error) {
            console.error('Error submitting feedback:', error);
            return {
                success: false,
                error: 'Failed to submit feedback. Please try again.',
            };
        }

        // Record submission for rate limiting
        await recordSubmission();

        return {
            success: true,
            feedbackId: data.id,
        };
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
};

/**
 * Get feedback submitted by current user
 */
export const getUserFeedback = async (
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<FeedbackListResponse> => {
    try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Get total count
        const { count } = await supabase
            .from('feedback')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Get paginated data
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching user feedback:', error);
            return {
                data: [],
                total: 0,
                page,
                pageSize,
                hasMore: false,
            };
        }

        // Map database columns to TypeScript interface
        const mappedData: Feedback[] = (data || []).map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            userRole: row.user_role,
            feedbackType: row.feedback_type as FeedbackType,
            message: row.message,
            rating: row.rating,
            screenshotUrl: row.screenshot_url,
            appVersion: row.app_version,
            deviceInfo: row.device_info,
            status: row.status as FeedbackStatus,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));

        const total = count || 0;

        return {
            data: mappedData,
            total,
            page,
            pageSize,
            hasMore: from + mappedData.length < total,
        };
    } catch (error) {
        console.error('Error in getUserFeedback:', error);
        return {
            data: [],
            total: 0,
            page,
            pageSize,
            hasMore: false,
        };
    }
};

/**
 * Get rate limit status for UI display
 */
export const getRateLimitStatus = async (): Promise<{
    remaining: number;
    resetTime: Date | null;
}> => {
    const { remaining, resetTime } = await checkRateLimit();
    return { remaining, resetTime };
};

/**
 * Clear rate limit (for testing only)
 */
export const clearRateLimit = async (): Promise<void> => {
    await AsyncStorage.removeItem(RATE_LIMIT_KEY);
};
