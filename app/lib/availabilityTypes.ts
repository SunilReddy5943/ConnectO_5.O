/**
 * Availability Types & Constants
 * ================================
 * Type definitions and configurations for worker availability system.
 */

// =============================================
// STATUS TYPES
// =============================================

export type AvailabilityStatus = 'ONLINE' | 'BUSY' | 'OFFLINE';

export type BusyReason =
    | 'ACTIVE_JOB'
    | 'PERSONAL'
    | 'BREAK'
    | 'CUSTOM';

// =============================================
// INTERFACES
// =============================================

export interface WorkingHours {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
}

export interface WorkerAvailability {
    id: string;
    userId: string;
    currentStatus: AvailabilityStatus;
    manualOverride: boolean;
    autoModeEnabled: boolean;
    lastActiveAt: Date;
    lastStatusChangeAt: Date;
    workingHours: WorkingHours;
    busyUntil?: Date;
    busyReason?: string;
    totalOnlineMinutes: number;
    responseRate: number;
    missedRequestsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AvailabilityUpdate {
    currentStatus?: AvailabilityStatus;
    manualOverride?: boolean;
    autoModeEnabled?: boolean;
    busyUntil?: Date;
    busyReason?: string;
    workingHours?: Partial<WorkingHours>;
}

// =============================================
// STATUS CONFIGURATION
// =============================================

export const STATUS_CONFIG = {
    ONLINE: {
        color: '#10B981',
        bgColor: '#10B98115',
        icon: 'checkmark-circle' as const,
        label: 'Online',
        customerLabel: 'Available now',
        description: 'Ready to receive calls and jobs',
    },
    BUSY: {
        color: '#F59E0B',
        bgColor: '#F59E0B15',
        icon: 'time' as const,
        label: 'Busy',
        customerLabel: 'Currently busy',
        description: 'Can receive messages only',
    },
    OFFLINE: {
        color: '#94A3B8',
        bgColor: '#94A3B815',
        icon: 'moon' as const,
        label: 'Offline',
        customerLabel: 'Not available',
        description: 'Not available for contact',
    },
} as const;

// =============================================
// AUTO-MODE RULES CONFIG
// =============================================

export const AUTO_MODE_CONFIG = {
    // How long (ms) app must be inactive before marking OFFLINE
    OFFLINE_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes

    // Min time (ms) between status changes
    STATUS_CHANGE_COOLDOWN_MS: 30 * 1000, // 30 seconds

    // Polling interval for status updates (customer-side) 
    POLLING_INTERVAL_MS: 10 * 1000, // 10 seconds

    // Default working hours
    DEFAULT_WORKING_HOURS: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5, 6], // Mon-Sat
    },
} as const;

// =============================================
// BUSY DURATION PRESETS
// =============================================

export const BUSY_DURATION_PRESETS = [
    { label: '15 minutes', minutes: 15 },
    { label: '30 minutes', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
    { label: '4 hours', minutes: 240 },
    { label: 'End of day', minutes: null }, // Calculate based on working hours
] as const;

// =============================================
// DAY OF WEEK HELPERS
// =============================================

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday', short: 'Su' },
    { value: 1, label: 'Monday', short: 'Mo' },
    { value: 2, label: 'Tuesday', short: 'Tu' },
    { value: 3, label: 'Wednesday', short: 'We' },
    { value: 4, label: 'Thursday', short: 'Th' },
    { value: 5, label: 'Friday', short: 'Fr' },
    { value: 6, label: 'Saturday', short: 'Sa' },
] as const;

// =============================================
// ACTION PERMISSIONS
// =============================================

export const ACTION_PERMISSIONS = {
    ONLINE: {
        canCall: true,
        canMessage: true,
        canNotify: true,
        canViewProfile: true,
    },
    BUSY: {
        canCall: false,
        canMessage: true,
        canNotify: true, // Queued
        canViewProfile: true,
    },
    OFFLINE: {
        canCall: false,
        canMessage: false,
        canNotify: false,
        canViewProfile: true,
    },
} as const;

// =============================================
// TYPE GUARDS
// =============================================

export function isValidStatus(status: string): status is AvailabilityStatus {
    return ['ONLINE', 'BUSY', 'OFFLINE'].includes(status);
}

export function getStatusConfig(status: AvailabilityStatus) {
    return STATUS_CONFIG[status];
}

export function getActionPermissions(status: AvailabilityStatus) {
    return ACTION_PERMISSIONS[status];
}

// =============================================
// VALIDATION
// =============================================

export const AVAILABILITY_VALIDATION = {
    MAX_BUSY_DURATION_HOURS: 24,
    MIN_STATUS_CHANGE_INTERVAL_MS: 30000, // 30 seconds
    MAX_CUSTOM_BUSY_REASON_LENGTH: 100,
} as const;
