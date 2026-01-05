/**
 * Worker Notify Repository
 * ========================
 * Supabase integration for the Instant Notify Worker feature.
 * Handles notification sending, cooldown tracking, and delivery status.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
    NotifyStatus,
    DeliveryStatus,
    WorkerNotification,
    CooldownInfo,
    NotifyResponse,
    NOTIFY_CONFIG,
} from './workerNotifyTypes';

// =============================================
// CONSTANTS
// =============================================

const COOLDOWN_STORAGE_KEY = 'worker_notify_cooldowns';

// =============================================
// COOLDOWN MANAGEMENT
// =============================================

/**
 * Get cooldown info for a specific worker
 */
export const getCooldownInfo = async (workerId: string): Promise<CooldownInfo> => {
    try {
        const stored = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (!stored) {
            return { isOnCooldown: false, remainingSeconds: 0, expiresAt: null };
        }

        const cooldowns: Record<string, number> = JSON.parse(stored);
        const expiresAt = cooldowns[workerId];

        if (!expiresAt) {
            return { isOnCooldown: false, remainingSeconds: 0, expiresAt: null };
        }

        const now = Date.now();
        if (now >= expiresAt) {
            // Cooldown expired, clean up
            delete cooldowns[workerId];
            await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(cooldowns));
            return { isOnCooldown: false, remainingSeconds: 0, expiresAt: null };
        }

        const remainingMs = expiresAt - now;
        return {
            isOnCooldown: true,
            remainingSeconds: Math.ceil(remainingMs / 1000),
            expiresAt,
        };
    } catch (error) {
        console.error('Error getting cooldown info:', error);
        return { isOnCooldown: false, remainingSeconds: 0, expiresAt: null };
    }
};

/**
 * Set cooldown for a worker
 */
const setCooldown = async (workerId: string): Promise<void> => {
    try {
        const stored = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
        const cooldowns: Record<string, number> = stored ? JSON.parse(stored) : {};

        cooldowns[workerId] = Date.now() + NOTIFY_CONFIG.COOLDOWN_MS;
        await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(cooldowns));
    } catch (error) {
        console.error('Error setting cooldown:', error);
    }
};

/**
 * Clear cooldown for a worker (for testing)
 */
export const clearCooldown = async (workerId: string): Promise<void> => {
    try {
        const stored = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (stored) {
            const cooldowns: Record<string, number> = JSON.parse(stored);
            delete cooldowns[workerId];
            await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(cooldowns));
        }
    } catch (error) {
        console.error('Error clearing cooldown:', error);
    }
};

// =============================================
// NOTIFICATION SENDING
// =============================================

/**
 * Send instant notification to worker
 */
export const notifyWorker = async (
    workerId: string,
    customerId: string,
    jobId?: string
): Promise<NotifyResponse> => {
    try {
        // Check cooldown first
        const cooldown = await getCooldownInfo(workerId);
        if (cooldown.isOnCooldown) {
            return {
                success: false,
                error: `Please wait ${Math.ceil(cooldown.remainingSeconds / 60)} minutes before notifying again`,
                cooldown,
            };
        }

        // Create notification record in database
        const notificationData = {
            worker_id: workerId,
            customer_id: customerId,
            job_id: jobId || null,
            type: 'manual_notify',
            status: DeliveryStatus.SENT,
            triggered_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('worker_notifications')
            .insert(notificationData)
            .select('id')
            .single();

        if (error) {
            // If table doesn't exist, continue anyway (local-only mode)
            console.warn('Supabase insert failed (table may not exist):', error.message);
        }

        // Set cooldown regardless of DB result
        await setCooldown(workerId);

        // In production, trigger push notification here
        // For now, we just record the notification
        await triggerPushNotification(workerId, customerId);

        return {
            success: true,
            notificationId: data?.id || `local_${Date.now()}`,
        };
    } catch (error) {
        console.error('Error notifying worker:', error);
        return {
            success: false,
            error: 'Failed to send notification. Please try again.',
        };
    }
};

/**
 * Trigger push notification to worker
 * In production, this would integrate with FCM/APNS
 */
const triggerPushNotification = async (
    workerId: string,
    customerId: string
): Promise<void> => {
    // TODO: Integrate with push notification service
    // For now, this is a placeholder that logs the notification
    console.log(`[NOTIFICATION] Sending to worker ${workerId} from customer ${customerId}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
};

/**
 * Get notification history for a customer
 */
export const getNotificationHistory = async (
    customerId: string,
    limit: number = 20
): Promise<WorkerNotification[]> => {
    try {
        const { data, error } = await supabase
            .from('worker_notifications')
            .select('*')
            .eq('customer_id', customerId)
            .order('triggered_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('Error fetching notification history:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            workerId: row.worker_id,
            customerId: row.customer_id,
            jobId: row.job_id,
            type: row.type,
            status: row.status,
            triggeredAt: row.triggered_at,
            deliveredAt: row.delivered_at,
            createdAt: row.created_at,
        }));
    } catch (error) {
        console.error('Error in getNotificationHistory:', error);
        return [];
    }
};
