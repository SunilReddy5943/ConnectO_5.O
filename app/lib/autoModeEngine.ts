/**
 * Auto-Mode Engine
 * =================
 * Core logic for automatic status determination.
 * Evaluates rules and calculates the correct worker status.
 */

import {
    AvailabilityStatus,
    WorkerAvailability,
    WorkingHours,
    AUTO_MODE_CONFIG,
} from './availabilityTypes';

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if current time is within working hours
 */
export function isWithinWorkingHours(
    currentTime: Date,
    workingHours: WorkingHours
): boolean {
    const currentDay = currentTime.getDay(); // 0-6
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Check if current day is a working day
    if (!workingHours.days.includes(currentDay)) {
        return false;
    }

    // Parse start and end times
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Check if worker has been inactive for too long
 */
export function isInactive(lastActiveAt: Date): boolean {
    const now = Date.now();
    const lastActive = lastActiveAt.getTime();
    const inactiveDuration = now - lastActive;

    return inactiveDuration > AUTO_MODE_CONFIG.OFFLINE_THRESHOLD_MS;
}

/**
 * Check if busy duration has expired
 */
export function isBusyExpired(busyUntil?: Date): boolean {
    if (!busyUntil) return true;
    return Date.now() > busyUntil.getTime();
}

// =============================================
// MAIN AUTO-STATUS ENGINE
// =============================================

export interface AutoStatusContext {
    hasActiveJob: boolean;
    isAppActive: boolean;
    currentTime?: Date;
}

/**
 * Calculate automatic status based on rules
 * 
 * Rule Priority:
 * 1. Manual override → return manual status
 * 2. Active job → BUSY
 * 3. App inactive → OFFLINE
 * 4. Outside working hours → OFFLINE
 * 5. Busy until time → BUSY
 * 6. Default → ONLINE
 */
export function calculateAutoStatus(
    worker: Partial<WorkerAvailability>,
    context: AutoStatusContext
): AvailabilityStatus {
    const currentTime = context.currentTime || new Date();

    // Rule 0: Manual override - skip auto logic
    if (worker.manualOverride) {
        return worker.currentStatus || 'OFFLINE';
    }

    // Rule 1: Active job → BUSY
    if (context.hasActiveJob) {
        return 'BUSY';
    }

    // Rule 2: App not active → OFFLINE
    if (!context.isAppActive) {
        // Check if worker has been inactive
        if (worker.lastActiveAt && isInactive(worker.lastActiveAt)) {
            return 'OFFLINE';
        }
    }

    // Rule 3: Outside working hours → OFFLINE
    if (worker.workingHours) {
        if (!isWithinWorkingHours(currentTime, worker.workingHours)) {
            return 'OFFLINE';
        }
    }

    // Rule 4: Manual busy until time → BUSY
    if (worker.busyUntil) {
        if (!isBusyExpired(worker.busyUntil)) {
            return 'BUSY';
        }
    }

    // Default: ONLINE
    return 'ONLINE';
}

// =============================================
// STATUS TRANSITION LOGIC
// =============================================

export interface StatusTransition {
    from: AvailabilityStatus;
    to: AvailabilityStatus;
    reason: string;
    timestamp: Date;
}

/**
 * Validate if status transition is allowed
 */
export function canTransitionStatus(
    from: AvailabilityStatus,
    to: AvailabilityStatus,
    lastChangeAt?: Date
): { allowed: boolean; reason?: string } {
    // Check cooldown
    if (lastChangeAt) {
        const timeSinceLastChange = Date.now() - lastChangeAt.getTime();
        if (timeSinceLastChange < AUTO_MODE_CONFIG.STATUS_CHANGE_COOLDOWN_MS) {
            return {
                allowed: false,
                reason: 'Status changed too recently. Please wait.',
            };
        }
    }

    // All transitions are allowed
    return { allowed: true };
}

/**
 * Create status transition record
 */
export function createStatusTransition(
    from: AvailabilityStatus,
    to: AvailabilityStatus,
    reason: string
): StatusTransition {
    return {
        from,
        to,
        reason,
        timestamp: new Date(),
    };
}

// =============================================
// SMART SUGGESTIONS
// =============================================

export interface StatusSuggestion {
    suggestedStatus: AvailabilityStatus;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Suggest status changes based on patterns
 * (Future enhancement - placeholder)
 */
export function suggestStatus(
    worker: Partial<WorkerAvailability>,
    context: AutoStatusContext
): StatusSuggestion | null {
    // Placeholder for ML-based suggestions
    // Could analyze patterns like:
    // - Typical work hours
    // - Response times
    // - Job frequency

    return null;
}

// =============================================
// WORKING HOURS UTILITIES
// =============================================

/**
 * Calculate end of day based on working hours
 */
export function getEndOfDay(workingHours: WorkingHours): Date {
    const now = new Date();
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    const endOfDay = new Date(now);
    endOfDay.setHours(endHour, endMin, 0, 0);

    // If end time has passed, set to tomorrow
    if (endOfDay < now) {
        endOfDay.setDate(endOfDay.getDate() + 1);
    }

    return endOfDay;
}

/**
 * Format busy until time for display
 */
export function formatBusyUntil(busyUntil?: Date): string {
    if (!busyUntil) return '';

    const now = Date.now();
    const target = busyUntil.getTime();
    const diff = target - now;

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
}
