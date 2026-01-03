"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef } from "react";

export default function AuthSync() {
    const { user, isLoading } = useUser();
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            if (isLoading || !user || hasSynced.current) return;

            try {
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
                hasSynced.current = true;
            } catch (error) {
                console.error('Error syncing user:', error);
            }
        };

        syncUser();
    }, [user, isLoading]);

    return null; // This component doesn't render anything
}
