/**
 * Worker Notify Types
 * ===================
 * Type definitions for the Instant Notify Worker feature.
 */

// =============================================
// ENUMS
// =============================================

/**
 * Button/notification states
 */
export enum NotifyStatus {
    READY = 'ready',
    NOTIFYING = 'notifying',
    NOTIFIED = 'notified',
    COOLDOWN = 'cooldown',
}

/**
 * Notification delivery status
 */
export enum DeliveryStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    FAILED = 'failed',
    QUEUED = 'queued',
}

// =============================================
// INTERFACES
// =============================================

/**
 * Worker notification record
 */
export interface WorkerNotification {
    id: string;
    workerId: string;
    customerId: string;
    jobId?: string;
    type: 'manual_notify';
    status: DeliveryStatus;
    triggeredAt: string;
    deliveredAt?: string;
    createdAt: string;
}

/**
 * Cooldown info for a worker
 */
export interface CooldownInfo {
    isOnCooldown: boolean;
    remainingSeconds: number;
    expiresAt: number | null;
}

/**
 * Notify response from repository
 */
export interface NotifyResponse {
    success: boolean;
    notificationId?: string;
    error?: string;
    cooldown?: CooldownInfo;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Cooldown configuration
 */
export const NOTIFY_CONFIG = {
    /** Cooldown period in milliseconds (5 minutes) */
    COOLDOWN_MS: 5 * 60 * 1000,
    /** Cooldown period in seconds */
    COOLDOWN_SECONDS: 5 * 60,
    /** Maximum notifications per hour per customer */
    MAX_PER_HOUR: 10,
};

/**
 * Notification message template
 */
export const NOTIFY_MESSAGE = {
    TITLE: '🔔 Customer Waiting',
    BODY: 'A customer is waiting for your response on ConnectO.',
    SUCCESS_TOAST: 'Worker has been notified',
    ERROR_TOAST: 'Failed to notify worker. Please try again.',
    COOLDOWN_TOAST: 'Please wait before notifying again',
};
