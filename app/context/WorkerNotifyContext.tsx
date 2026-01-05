/**
 * Worker Notify Context
 * =====================
 * State management for the Instant Notify Worker feature.
 * Handles cooldown tracking, modal visibility, and notification sending.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, ToastAndroid, Platform } from 'react-native';
import {
    notifyWorker,
    getCooldownInfo,
} from '../lib/workerNotifyRepository';
import {
    NotifyStatus,
    CooldownInfo,
    NOTIFY_MESSAGE,
    NOTIFY_CONFIG,
} from '../lib/workerNotifyTypes';
import { useAuth } from './AuthContext';

// =============================================
// TYPES
// =============================================

interface WorkerNotifyState {
    status: NotifyStatus;
    cooldownSeconds: number;
}

interface WorkerNotifyContextType {
    // Modal state
    modalVisible: boolean;
    modalWorker: { id: string; name: string } | null;

    // Get status for a specific worker
    getWorkerStatus: (workerId: string) => WorkerNotifyState;

    // Actions
    openNotifyModal: (workerId: string, workerName: string) => void;
    closeNotifyModal: () => void;
    confirmNotify: () => Promise<void>;
    refreshCooldown: (workerId: string) => Promise<void>;
}

const WorkerNotifyContext = createContext<WorkerNotifyContextType | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================

interface WorkerNotifyProviderProps {
    children: ReactNode;
}

export function WorkerNotifyProvider({ children }: WorkerNotifyProviderProps) {
    const { user } = useAuth();

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalWorker, setModalWorker] = useState<{ id: string; name: string } | null>(null);
    const [isNotifying, setIsNotifying] = useState(false);

    // Track status per worker
    const [workerStates, setWorkerStates] = useState<Record<string, WorkerNotifyState>>({});

    /**
     * Show toast message
     */
    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            // On iOS, we could use a custom toast library
            // For now, use Alert for important messages
        }
    };

    /**
     * Get status for a specific worker
     */
    const getWorkerStatus = useCallback((workerId: string): WorkerNotifyState => {
        return workerStates[workerId] || {
            status: NotifyStatus.READY,
            cooldownSeconds: 0,
        };
    }, [workerStates]);

    /**
     * Update worker state
     */
    const updateWorkerState = (workerId: string, state: Partial<WorkerNotifyState>) => {
        setWorkerStates(prev => ({
            ...prev,
            [workerId]: {
                ...prev[workerId] || { status: NotifyStatus.READY, cooldownSeconds: 0 },
                ...state,
            },
        }));
    };

    /**
     * Refresh cooldown status for a worker
     */
    const refreshCooldown = useCallback(async (workerId: string) => {
        const cooldown = await getCooldownInfo(workerId);

        if (cooldown.isOnCooldown) {
            updateWorkerState(workerId, {
                status: NotifyStatus.COOLDOWN,
                cooldownSeconds: cooldown.remainingSeconds,
            });
        }
    }, []);

    /**
     * Open notify confirmation modal
     */
    const openNotifyModal = useCallback(async (workerId: string, workerName: string) => {
        if (!user?.id) {
            Alert.alert('Login Required', 'Please log in to notify workers.');
            return;
        }

        // Check cooldown first
        const cooldown = await getCooldownInfo(workerId);
        if (cooldown.isOnCooldown) {
            updateWorkerState(workerId, {
                status: NotifyStatus.COOLDOWN,
                cooldownSeconds: cooldown.remainingSeconds,
            });
            showToast(NOTIFY_MESSAGE.COOLDOWN_TOAST);
            return;
        }

        setModalWorker({ id: workerId, name: workerName });
        setModalVisible(true);
    }, [user]);

    /**
     * Close notify modal
     */
    const closeNotifyModal = useCallback(() => {
        setModalVisible(false);
        setModalWorker(null);
    }, []);

    /**
     * Confirm and send notification
     */
    const confirmNotify = useCallback(async () => {
        if (!user?.id || !modalWorker) return;

        const workerId = modalWorker.id;

        setIsNotifying(true);
        updateWorkerState(workerId, { status: NotifyStatus.NOTIFYING });

        try {
            const response = await notifyWorker(workerId, user.id);

            if (response.success) {
                // Show success state
                updateWorkerState(workerId, {
                    status: NotifyStatus.NOTIFIED,
                    cooldownSeconds: 0,
                });

                showToast(NOTIFY_MESSAGE.SUCCESS_TOAST);
                closeNotifyModal();

                // After 2 seconds, switch to cooldown state
                setTimeout(() => {
                    updateWorkerState(workerId, {
                        status: NotifyStatus.COOLDOWN,
                        cooldownSeconds: NOTIFY_CONFIG.COOLDOWN_SECONDS,
                    });
                }, 2000);
            } else {
                // Handle error
                updateWorkerState(workerId, { status: NotifyStatus.READY });

                if (response.cooldown?.isOnCooldown) {
                    updateWorkerState(workerId, {
                        status: NotifyStatus.COOLDOWN,
                        cooldownSeconds: response.cooldown.remainingSeconds,
                    });
                }

                Alert.alert('Notification Failed', response.error || NOTIFY_MESSAGE.ERROR_TOAST);
            }
        } catch (error) {
            console.error('Error in confirmNotify:', error);
            updateWorkerState(workerId, { status: NotifyStatus.READY });
            Alert.alert('Error', NOTIFY_MESSAGE.ERROR_TOAST);
        } finally {
            setIsNotifying(false);
        }
    }, [user, modalWorker, closeNotifyModal]);

    const value: WorkerNotifyContextType = {
        modalVisible,
        modalWorker,
        getWorkerStatus,
        openNotifyModal,
        closeNotifyModal,
        confirmNotify,
        refreshCooldown,
    };

    return (
        <WorkerNotifyContext.Provider value={value}>
            {children}
        </WorkerNotifyContext.Provider>
    );
}

// =============================================
// HOOK
// =============================================

export function useWorkerNotify(): WorkerNotifyContextType {
    const context = useContext(WorkerNotifyContext);
    if (context === undefined) {
        throw new Error('useWorkerNotify must be used within a WorkerNotifyProvider');
    }
    return context;
}

/**
 * Hook to check if notifying is in progress
 */
export function useIsNotifying(workerId: string): boolean {
    const { getWorkerStatus } = useWorkerNotify();
    const status = getWorkerStatus(workerId);
    return status.status === NotifyStatus.NOTIFYING;
}
