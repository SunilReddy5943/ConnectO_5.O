/**
 * Feedback Context
 * ================
 * State management for the User Feedback & Feature Request System.
 * Handles submission state, rate limiting, and feedback history.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import {
    submitFeedback,
    getUserFeedback,
    getRateLimitStatus,
} from '../lib/feedbackRepository';
import {
    Feedback,
    CreateFeedbackDTO,
    FeedbackSubmitResponse,
    FeedbackListResponse,
} from '../lib/feedbackTypes';
import { useAuth } from './AuthContext';

// =============================================
// TYPES
// =============================================

interface FeedbackContextType {
    // State
    isSubmitting: boolean;
    submitError: string | null;
    submitSuccess: boolean;
    feedbackHistory: Feedback[];
    isLoadingHistory: boolean;
    hasMoreHistory: boolean;
    rateLimitRemaining: number;

    // Actions
    submit: (dto: CreateFeedbackDTO) => Promise<boolean>;
    loadHistory: (refresh?: boolean) => Promise<void>;
    resetSubmitState: () => void;
    checkRateLimit: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================

interface FeedbackProviderProps {
    children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
    const { user, activeRole } = useAuth();

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // History state
    const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);

    // Rate limit state
    const [rateLimitRemaining, setRateLimitRemaining] = useState(3);

    /**
     * Submit new feedback
     */
    const submit = useCallback(async (dto: CreateFeedbackDTO): Promise<boolean> => {
        if (!user?.id) {
            setSubmitError('Please log in to submit feedback.');
            return false;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            // ADMIN role submits feedback as CUSTOMER (ADMIN is not a valid feedback user role)
            const feedbackRole = activeRole === 'WORKER' ? 'WORKER' : 'CUSTOMER';
            const response = await submitFeedback(
                dto,
                user.id,
                feedbackRole
            );

            if (response.success) {
                setSubmitSuccess(true);
                setRateLimitRemaining((prev) => Math.max(0, prev - 1));
                return true;
            } else {
                setSubmitError(response.error || 'Failed to submit feedback.');
                if (response.rateLimited) {
                    // Show alert for rate limit
                    Alert.alert(
                        'Submission Limit Reached',
                        response.error || 'Please try again later.',
                        [{ text: 'OK' }]
                    );
                }
                return false;
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSubmitError('An unexpected error occurred.');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [user, activeRole]);

    /**
     * Load feedback history
     */
    const loadHistory = useCallback(async (refresh = false) => {
        if (!user?.id) return;

        if (refresh) {
            setHistoryPage(1);
            setFeedbackHistory([]);
            setHasMoreHistory(true);
        }

        if (!hasMoreHistory && !refresh) return;

        setIsLoadingHistory(true);

        try {
            const page = refresh ? 1 : historyPage;
            const response = await getUserFeedback(user.id, page, 10);

            if (refresh) {
                setFeedbackHistory(response.data);
            } else {
                setFeedbackHistory((prev) => [...prev, ...response.data]);
            }

            setHasMoreHistory(response.hasMore);
            setHistoryPage(page + 1);
        } catch (error) {
            console.error('Error loading feedback history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [user, historyPage, hasMoreHistory]);

    /**
     * Reset submission state (for form reset)
     */
    const resetSubmitState = useCallback(() => {
        setSubmitError(null);
        setSubmitSuccess(false);
    }, []);

    /**
     * Check current rate limit status
     */
    const checkRateLimit = useCallback(async () => {
        try {
            const status = await getRateLimitStatus();
            setRateLimitRemaining(status.remaining);
        } catch (error) {
            console.error('Error checking rate limit:', error);
        }
    }, []);

    const value: FeedbackContextType = {
        isSubmitting,
        submitError,
        submitSuccess,
        feedbackHistory,
        isLoadingHistory,
        hasMoreHistory,
        rateLimitRemaining,
        submit,
        loadHistory,
        resetSubmitState,
        checkRateLimit,
    };

    return (
        <FeedbackContext.Provider value={value}>
            {children}
        </FeedbackContext.Provider>
    );
}

// =============================================
// HOOK
// =============================================

export function useFeedback(): FeedbackContextType {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
}
