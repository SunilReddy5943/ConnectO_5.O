/**
 * Feedback System Types
 * ====================
 * Complete type definitions for the User Feedback & Feature Request System.
 * Designed to be future-ready for upvoting, clustering, and roadmap integration.
 */

// =============================================
// ENUMS
// =============================================

/**
 * Types of feedback users can submit
 */
export enum FeedbackType {
    BUG_REPORT = 'bug_report',
    FEATURE_REQUEST = 'feature_request',
    IMPROVEMENT = 'improvement',
    GENERAL = 'general',
}

/**
 * Status of feedback in the review pipeline
 */
export enum FeedbackStatus {
    NEW = 'new',
    REVIEWED = 'reviewed',
    PLANNED = 'planned',
    RESOLVED = 'resolved',
}

/**
 * User role when submitting feedback
 */
export type UserRole = 'CUSTOMER' | 'WORKER';

// =============================================
// INTERFACES
// =============================================

/**
 * Device information captured with feedback
 */
export interface DeviceInfo {
    platform: 'ios' | 'android' | 'web';
    osVersion?: string;
    deviceModel?: string;
    screenWidth?: number;
    screenHeight?: number;
}

/**
 * Complete feedback record as stored in database
 */
export interface Feedback {
    id: string;
    userId: string;
    userRole: UserRole;
    feedbackType: FeedbackType;
    message: string;
    rating: number | null;
    screenshotUrl: string | null;
    appVersion: string;
    deviceInfo: DeviceInfo | null;
    status: FeedbackStatus;
    createdAt: string;
    updatedAt: string;
    // Future fields for upvoting and clustering
    upvotes?: number;
    clusterId?: string | null;
    roadmapItemId?: string | null;
}

/**
 * Data transfer object for creating new feedback
 */
export interface CreateFeedbackDTO {
    feedbackType: FeedbackType;
    message: string;
    rating?: number | null;
    screenshotUri?: string | null;
}

/**
 * Filters for querying feedback
 */
export interface FeedbackFilters {
    status?: FeedbackStatus;
    feedbackType?: FeedbackType;
    startDate?: string;
    endDate?: string;
}

/**
 * Response from feedback submission
 */
export interface FeedbackSubmitResponse {
    success: boolean;
    feedbackId?: string;
    error?: string;
    rateLimited?: boolean;
}

/**
 * Paginated feedback list response
 */
export interface FeedbackListResponse {
    data: Feedback[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// =============================================
// CONSTANTS
// =============================================

/**
 * Feedback type display configuration
 */
export const FEEDBACK_TYPE_CONFIG: Record<FeedbackType, {
    label: string;
    icon: string;
    color: string;
    description: string;
}> = {
    [FeedbackType.BUG_REPORT]: {
        label: 'Bug Report',
        icon: 'bug',
        color: '#EF4444',
        description: 'Something is broken or not working correctly',
    },
    [FeedbackType.FEATURE_REQUEST]: {
        label: 'Feature Request',
        icon: 'bulb',
        color: '#F59E0B',
        description: 'Suggest a new feature or capability',
    },
    [FeedbackType.IMPROVEMENT]: {
        label: 'Improvement',
        icon: 'trending-up',
        color: '#10B981',
        description: 'Make an existing feature better',
    },
    [FeedbackType.GENERAL]: {
        label: 'General Feedback',
        icon: 'chatbubble-ellipses',
        color: '#3B82F6',
        description: 'Share your thoughts with us',
    },
};

/**
 * Status display configuration
 */
export const FEEDBACK_STATUS_CONFIG: Record<FeedbackStatus, {
    label: string;
    icon: string;
    color: string;
}> = {
    [FeedbackStatus.NEW]: {
        label: 'Submitted',
        icon: 'time',
        color: '#94A3B8',
    },
    [FeedbackStatus.REVIEWED]: {
        label: 'Under Review',
        icon: 'eye',
        color: '#3B82F6',
    },
    [FeedbackStatus.PLANNED]: {
        label: 'Planned',
        icon: 'calendar',
        color: '#8B5CF6',
    },
    [FeedbackStatus.RESOLVED]: {
        label: 'Resolved',
        icon: 'checkmark-circle',
        color: '#10B981',
    },
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
    MAX_SUBMISSIONS_PER_HOUR: 3,
    COOLDOWN_MESSAGE: 'You can submit up to 3 feedback per hour. Please try again later.',
};

/**
 * Validation constants
 */
export const VALIDATION = {
    MESSAGE_MAX_LENGTH: 500,
    MESSAGE_MIN_LENGTH: 10,
};
