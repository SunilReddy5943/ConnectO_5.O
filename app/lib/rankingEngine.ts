/**
 * Ranking Engine
 * ===============
 * Intelligent worker ranking with multi-signal scoring.
 * Core logic for search result ordering.
 */

import { AvailabilityStatus } from './availabilityTypes';

// =============================================
// TYPES
// =============================================

export interface GeoPoint {
    lat: number;
    lon: number;
}

export interface RankingSignals {
    // Core signals
    availabilityStatus: AvailabilityStatus;
    distanceKm: number;
    rating: number;
    responseTimeMinutes: number;
    completionRate: number; // 0-100
    hoursSinceActive: number;
    isVerified: boolean;
    totalJobsCompleted: number;
}

export interface RankingWeights {
    availability: number;    // 30
    distance: number;         // 20
    rating: number;           // 20
    responseTime: number;     // 12
    completionRate: number;   // 10
    activity: number;         // 5
    verification: number;     // 3
}

export interface RankedWorker {
    workerId: string;
    rankingScore: number;
    signals: RankingSignals;
    rank: number;
}

export interface RankingOptions {
    maxRadius?: number; // km
    newWorkerBoost?: number;
    shuffleStrength?: number; // 0-1
}

// =============================================
// DEFAULT WEIGHTS
// =============================================

export const DEFAULT_WEIGHTS: RankingWeights = {
    availability: 30,
    distance: 20,
    rating: 20,
    responseTime: 12,
    completionRate: 10,
    activity: 5,
    verification: 3,
};

// =============================================
// INDIVIDUAL SCORE CALCULATIONS
// =============================================

/**
 * Availability score: ONLINE=100, BUSY=50, OFFLINE=0
 */
function calculateAvailabilityScore(status: AvailabilityStatus): number {
    switch (status) {
        case 'ONLINE':
            return 100;
        case 'BUSY':
            return 50;
        case 'OFFLINE':
            return 0;
        default:
            return 0;
    }
}

/**
 * Distance score: Closer = higher (inverse scoring)
 */
function calculateDistanceScore(distanceKm: number, maxRadius: number = 25): number {
    if (distanceKm > maxRadius) return 0;
    return Math.max(0, 100 - (distanceKm / maxRadius) * 100);
}

/**
 * Rating score: Convert 0-5 to 0-100
 */
function calculateRatingScore(rating: number): number {
    return (rating / 5) * 100;
}

/**
 * Response time score: Faster = higher (inverse)
 */
function calculateResponseScore(responseTimeMinutes: number): number {
    // 0 min = 100, 60 min = 0
    return Math.max(0, 100 - (responseTimeMinutes / 60) * 100);
}

/**
 * Completion rate score: Direct percentage
 */
function calculateCompletionScore(completionRate: number): number {
    return Math.min(100, Math.max(0, completionRate));
}

/**
 * Activity score: Recent = higher
 */
function calculateActivityScore(hoursSinceActive: number): number {
    // 0 hours = 100, 168 hours (7 days) = 0
    return Math.max(0, 100 - (hoursSinceActive / 168) * 100);
}

/**
 * Verification score: Binary
 */
function calculateVerificationScore(isVerified: boolean): number {
    return isVerified ? 100 : 0;
}

// =============================================
// MAIN RANKING FUNCTION
// =============================================

/**
 * Calculate weighted ranking score for a worker
 */
export function calculateRankingScore(
    signals: RankingSignals,
    weights: RankingWeights = DEFAULT_WEIGHTS,
    options?: RankingOptions
): number {
    // Calculate individual scores (0-100)
    const availScore = calculateAvailabilityScore(signals.availabilityStatus);
    const distScore = calculateDistanceScore(signals.distanceKm, options?.maxRadius);
    const ratingScore = calculateRatingScore(signals.rating);
    const responseScore = calculateResponseScore(signals.responseTimeMinutes);
    const completionScore = calculateCompletionScore(signals.completionRate);
    const activityScore = calculateActivityScore(signals.hoursSinceActive);
    const verificationScore = calculateVerificationScore(signals.isVerified);

    // Apply weights (normalize to 0-100 final score)
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

    let score =
        (availScore * weights.availability +
            distScore * weights.distance +
            ratingScore * weights.rating +
            responseScore * weights.responseTime +
            completionScore * weights.completionRate +
            activityScore * weights.activity +
            verificationScore * weights.verification) /
        totalWeight;

    // New worker boost
    const newWorkerBoost = options?.newWorkerBoost ?? 5;
    if (signals.totalJobsCompleted < 10) {
        score += newWorkerBoost;
    }

    return Math.min(100, Math.max(0, score));
}

// =============================================
// WORKER RANKING
// =============================================

/**
 * Calculate distance between two geo points (Haversine formula)
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371; // Earth radius in km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lon - point1.lon) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Rank array of workers
 */
export function rankWorkers<T extends { signals: RankingSignals; workerId: string }>(
    workers: T[],
    options?: RankingOptions
): Array<T & { rankingScore: number; rank: number }> {
    // Calculate scores
    const scored = workers.map((worker) => ({
        ...worker,
        rankingScore: calculateRankingScore(worker.signals, DEFAULT_WEIGHTS, options),
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b.rankingScore - a.rankingScore);

    // Assign ranks
    return scored.map((worker, index) => ({
        ...worker,
        rank: index + 1,
    }));
}

// =============================================
// FAIR EXPOSURE (CONTROLLED SHUFFLE)
// =============================================

/**
 * Apply controlled shuffle to prevent always showing same workers
 */
export function applyControlledShuffle<T extends { rank: number }>(
    workers: T[],
    strength: number = 0.1
): T[] {
    if (workers.length === 0) return workers;

    return workers.map((worker, index) => {
        // Top 3: No shuffle
        if (worker.rank <= 3) return worker;

        // Rank 4-10: ±1 position
        if (worker.rank <= 10) {
            const offset = Math.random() < 0.5 ? -1 : 1;
            const newIndex = Math.max(3, Math.min(workers.length - 1, index + offset));
            return workers[newIndex];
        }

        // Rank 11-20: ±2 positions
        if (worker.rank <= 20) {
            const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newIndex = Math.max(10, Math.min(workers.length - 1, index + offset));
            return workers[newIndex];
        }

        // Rank 21+: ±3 positions
        const offset = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newIndex = Math.max(20, Math.min(workers.length - 1, index + offset));
        return workers[newIndex];
    });
}

// =============================================
// DEBUGGING UTILITIES
// =============================================

/**
 * Get detailed score breakdown for debugging
 */
export function getScoreBreakdown(
    signals: RankingSignals,
    weights: RankingWeights = DEFAULT_WEIGHTS
): Record<string, number> {
    return {
        availability: calculateAvailabilityScore(signals.availabilityStatus),
        distance: calculateDistanceScore(signals.distanceKm),
        rating: calculateRatingScore(signals.rating),
        responseTime: calculateResponseScore(signals.responseTimeMinutes),
        completionRate: calculateCompletionScore(signals.completionRate),
        activity: calculateActivityScore(signals.hoursSinceActive),
        verification: calculateVerificationScore(signals.isVerified),
    };
}
