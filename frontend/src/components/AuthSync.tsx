"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { apiClient } from "@/lib/api-client";

export default function AuthSync() {
    const { user, isLoading } = useUser();
    const { setCurrentUser, setOrganizations, setActiveOrgId, activeOrgId } = useApp();
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            if (isLoading || !user || hasSynced.current) return;

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
                    if (!activeOrgId && orgsResult.data.length > 0) {
                        setActiveOrgId(orgsResult.data[0].id);
                    }
                }

                hasSynced.current = true;
            } catch (error) {
                console.error('Error syncing user:', error);
            }
        };

        syncUser();
    }, [user, isLoading]);

    return null; // This component doesn't render anything
}
