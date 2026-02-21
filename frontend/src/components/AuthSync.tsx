"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { apiClient } from "@/lib/api-client";

export default function AuthSync() {
    const { user, isLoading } = useUser();
    const { setCurrentUser, setOrganizations, setActiveOrgId, activeOrgId, setIsInitialSyncComplete } = useApp();
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            if (isLoading || hasSynced.current) return;

            if (!user) {
                // If there is no user, still mark sync as complete so the app stops loading
                setIsInitialSyncComplete(true);
                return;
            }

            try {
                // Sync user with backend
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/users/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        auth0Id: user.sub,
                        email: user.email,
                        fullName: user.name,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to sync user');
                }

                const syncedUser = await response.json();
                console.log('User synced successfully:', syncedUser);

                // Update app context with user data
                setCurrentUser(syncedUser);

                // Load user's organizations
                const orgsResult = await apiClient.getOrganizations(syncedUser.id);
                if (orgsResult.data) {
                    setOrganizations(orgsResult.data);

                    // Set active org if not already set
                    // Also check if no active org is set in local storage
                    const savedOrgId = localStorage.getItem('activeOrgId');
                    if (!savedOrgId && orgsResult.data.length > 0) {
                        setActiveOrgId(orgsResult.data[0].id);
                    }
                }

                hasSynced.current = true;
            } catch (error) {
                console.error('Error syncing user:', error);
            } finally {
                setIsInitialSyncComplete(true);
            }
        };

        syncUser();
    }, [user, isLoading, setCurrentUser, setOrganizations, setActiveOrgId, setIsInitialSyncComplete]);

    return null; // This component doesn't render anything
}
