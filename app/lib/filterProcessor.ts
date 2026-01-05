/**
 * Filter Processor
 * =================
 * Apply eligibility and user filters to worker list.
 */

import { AvailabilityStatus } from './availabilityTypes';
import { GeoPoint, calculateDistance } from './rankingEngine';

// =============================================
// TYPES
// =============================================

export interface SearchFilters {
    // Core
    skill: string;
    location: GeoPoint;
    radius: number; // km

    // Availability
    onlineOnly?: boolean;
    availableToday?: boolean;

    // Experience
    minExperience?: number;
    maxExperience?: number;

    // Pricing
    minPrice?: number;
    maxPrice?: number;
    priceType?: 'HOURLY' | 'FIXED';

    // Quality
    minRating?: number;

    // Trust
    verifiedOnly?: boolean;
}

export interface Worker {
    id: string;
    userId: string;
    primarySkill: string;
    skills: string[];
    location: GeoPoint;
    serviceRadiusKm: number;
    availabilityStatus: AvailabilityStatus;
    yearsOfExperience: number;
    startingPrice: number;
    priceType: 'HOURLY' | 'FIXED';
    rating: number;
    isVerified: boolean;
    isActive: boolean;
    profileCompleteness: number; // 0-100
}

// =============================================
// ELIGIBILITY FILTERS (HARD)
// =============================================

/**
 * Apply hard eligibility filters
 * Workers must pass ALL to appear in results
 */
export function applyEligibilityFilters(
    workers: Worker[],
    filters: SearchFilters
): Worker[] {
    return workers.filter((worker) => {
        // Must be active
        if (!worker.isActive) return false;

        // Must have required skill
        const hasSkill =
            worker.primarySkill.toLowerCase() === filters.skill.toLowerCase() ||
            worker.skills.some(s => s.toLowerCase() === filters.skill.toLowerCase());
        if (!hasSkill) return false;

        // Must be within service radius
        const distance = calculateDistance(filters.location, worker.location);
        if (distance > worker.serviceRadiusKm) return false;

        // Customer must be within worker's service area
        if (distance > filters.radius) return false;

        // Must not be OFFLINE (online or busy acceptable)
        if (worker.availabilityStatus === 'OFFLINE') return false;

        // Profile must be reasonably complete
        if (worker.profileCompleteness < 60) return false;

        return true;
    });
}

// =============================================
// USER FILTERS (SOFT)
// =============================================

/**
 * Apply user-selected filters
 */
export function applyUserFilters(
    workers: Worker[],
    filters: SearchFilters
): Worker[] {
    return workers.filter((worker) => {
        // Availability: Online only
        if (filters.onlineOnly && worker.availabilityStatus !== 'ONLINE') {
            return false;
        }

        // Experience range
        if (filters.minExperience !== undefined) {
            if (worker.yearsOfExperience < filters.minExperience) return false;
        }
        if (filters.maxExperience !== undefined) {
            if (worker.yearsOfExperience > filters.maxExperience) return false;
        }

        // Price range
        if (filters.minPrice !== undefined) {
            if (worker.startingPrice < filters.minPrice) return false;
        }
        if (filters.maxPrice !== undefined) {
            if (worker.startingPrice > filters.maxPrice) return false;
        }

        // Price type
        if (filters.priceType) {
            if (worker.priceType !== filters.priceType) return false;
        }

        // Rating threshold
        if (filters.minRating !== undefined) {
            if (worker.rating < filters.minRating) return false;
        }

        // Verification
        if (filters.verifiedOnly && !worker.isVerified) {
            return false;
        }

        return true;
    });
}

// =============================================
// FILTER VALIDATION
// =============================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate search filters
 */
export function validateFilters(filters: SearchFilters): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!filters.skill || filters.skill.trim() === '') {
        errors.push('Skill is required');
    }

    if (!filters.location) {
        errors.push('Location is required');
    }

    if (!filters.radius || filters.radius <= 0) {
        errors.push('Valid radius is required');
    }

    // Range validations
    if (filters.radius > 100) {
        errors.push('Radius cannot exceed 100km');
    }

    if (filters.minExperience !== undefined && filters.minExperience < 0) {
        errors.push('Min experience cannot be negative');
    }

    if (
        filters.minExperience !== undefined &&
        filters.maxExperience !== undefined &&
        filters.minExperience > filters.maxExperience
    ) {
        errors.push('Min experience cannot exceed max experience');
    }

    if (filters.minPrice !== undefined && filters.minPrice < 0) {
        errors.push('Min price cannot be negative');
    }

    if (
        filters.minPrice !== undefined &&
        filters.maxPrice !== undefined &&
        filters.minPrice > filters.maxPrice
    ) {
        errors.push('Min price cannot exceed max price');
    }

    if (filters.minRating !== undefined) {
        if (filters.minRating < 0 || filters.minRating > 5) {
            errors.push('Rating must be between 0 and 5');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// =============================================
// FILTER UTILITIES
// =============================================

/**
 * Get active filter count
 */
export function getActiveFilterCount(filters: SearchFilters): number {
    let count = 0;

    if (filters.onlineOnly) count++;
    if (filters.availableToday) count++;
    if (filters.minExperience !== undefined || filters.maxExperience !== undefined) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.priceType) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.verifiedOnly) count++;

    return count;
}

/**
 * Clear all user filters (keep core search params)
 */
export function clearFilters(filters: SearchFilters): SearchFilters {
    return {
        skill: filters.skill,
        location: filters.location,
        radius: filters.radius,
    };
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(filters: SearchFilters): string[] {
    const summary: string[] = [];

    if (filters.onlineOnly) summary.push('Online only');
    if (filters.availableToday) summary.push('Available today');

    if (filters.minExperience !== undefined || filters.maxExperience !== undefined) {
        const min = filters.minExperience ?? 0;
        const max = filters.maxExperience ?? '∞';
        summary.push(`${min}-${max} years exp`);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? '∞';
        summary.push(`₹${min}-${max}`);
    }

    if (filters.priceType) {
        summary.push(filters.priceType === 'HOURLY' ? 'Hourly rate' : 'Fixed price');
    }

    if (filters.minRating !== undefined) {
        summary.push(`${filters.minRating}★+`);
    }

    if (filters.verifiedOnly) {
        summary.push('Verified only');
    }

    return summary;
}
