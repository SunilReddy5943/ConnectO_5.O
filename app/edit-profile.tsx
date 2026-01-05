/**
 * Edit Profile Router
 * ===================
 * Routes to role-specific edit profile screen.
 */

import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function EditProfileRouter() {
    const { activeRole, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/auth/login" />;
    }

    // Route based on active role
    if (activeRole === 'WORKER') {
        return <Redirect href="/edit-profile-worker" />;
    }

    return <Redirect href="/edit-profile-customer" />;
}
