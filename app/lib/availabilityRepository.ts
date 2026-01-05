/**
 * Availability Repository
 * =======================
 * Database operations for worker availability management.
 */

import { supabase } from './supabase';
import {
    WorkerAvailability,
    AvailabilityStatus,
    AvailabilityUpdate,
    WorkingHours,
    AUTO_MODE_CONFIG,
} from './availabilityTypes';

// =============================================
// FETCH OPERATIONS
// =============================================

/**
 * Get worker availability by user ID
 */
export async function getWorkerAvailability(
    userId: string
): Promise<{ success: boolean; data?: WorkerAvailability; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('worker_availability')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no record exists, create default one
            if (error.code === 'PGRST116') {
                return await createDefaultAvailability(userId);
            }
            throw error;
        }

        return {
            success: true,
            data: mapToAvailability(data),
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch availability',
        };
    }
}

/**
 * Get availability for multiple workers (bulk)
 */
export async function getBulkAvailability(
    userIds: string[]
): Promise<{ success: boolean; data?: Record<string, WorkerAvailability>; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('worker_availability')
            .select('*')
            .in('user_id', userIds);

        if (error) throw error;

        const availabilityMap: Record<string, WorkerAvailability> = {};
        data?.forEach((item) => {
            availabilityMap[item.user_id] = mapToAvailability(item);
        });

        return { success: true, data: availabilityMap };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =============================================
// UPDATE OPERATIONS
// =============================================

/**
 * Update worker status (manual or auto)
 */
export async function updateWorkerStatus(
    userId: string,
    status: AvailabilityStatus,
    manual: boolean = true
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('worker_availability')
            .update({
                current_status: status,
                manual_override: manual,
                last_status_change_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Toggle auto mode
 */
export async function toggleAutoMode(
    userId: string,
    enabled: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('worker_availability')
            .update({
                auto_mode_enabled: enabled,
                manual_override: !enabled,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Set busy duration
 */
export async function setBusyUntil(
    userId: string,
    minutes: number | null,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        let busyUntil: Date | null = null;

        if (minutes !== null) {
            busyUntil = new Date();
            busyUntil.setMinutes(busyUntil.getMinutes() + minutes);
        }

        const { error } = await supabase
            .from('worker_availability')
            .update({
                busy_until: busyUntil?.toISOString() || null,
                busy_reason: reason || null,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Update working hours
 */
export async function updateWorkingHours(
    userId: string,
    workingHours: Partial<WorkingHours>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current working hours
        const { data: current } = await supabase
            .from('worker_availability')
            .select('working_hours')
            .eq('user_id', userId)
            .single();

        const updatedHours = {
            ...current?.working_hours,
            ...workingHours,
        };

        const { error } = await supabase
            .from('worker_availability')
            .update({
                working_hours: updatedHours,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Update last active timestamp (heartbeat)
 */
export async function updateLastActive(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('worker_availability')
            .update({
                last_active_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Create default availability record
 */
async function createDefaultAvailability(
    userId: string
): Promise<{ success: boolean; data?: WorkerAvailability; error?: string }> {
    try {
        const defaultData = {
            user_id: userId,
            current_status: 'OFFLINE',
            auto_mode_enabled: true,
            manual_override: false,
            working_hours: AUTO_MODE_CONFIG.DEFAULT_WORKING_HOURS,
        };

        const { data, error } = await supabase
            .from('worker_availability')
            .insert(defaultData)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            data: mapToAvailability(data),
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Map database record to WorkerAvailability type
 */
function mapToAvailability(data: any): WorkerAvailability {
    return {
        id: data.id,
        userId: data.user_id,
        currentStatus: data.current_status as AvailabilityStatus,
        manualOverride: data.manual_override,
        autoModeEnabled: data.auto_mode_enabled,
        lastActiveAt: new Date(data.last_active_at),
        lastStatusChangeAt: new Date(data.last_status_change_at),
        workingHours: data.working_hours as WorkingHours,
        busyUntil: data.busy_until ? new Date(data.busy_until) : undefined,
        busyReason: data.busy_reason,
        totalOnlineMinutes: data.total_online_minutes,
        responseRate: data.response_rate,
        missedRequestsCount: data.missed_requests_count,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    };
}
