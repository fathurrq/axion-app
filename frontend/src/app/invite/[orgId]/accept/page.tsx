'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api-client';

export default function AcceptInvitePage() {
    const router = useRouter();
    const params = useParams();
    const { currentUser, setOrganizations, setActiveOrgId } = useApp();
    const [status, setStatus] = useState('Checking authorization...');
    const [error, setError] = useState<string | null>(null);

    const orgId = params.orgId as string;

    useEffect(() => {
        // Wait until currentUser is loaded by AuthSync
        if (!currentUser) {
            return;
        }

        const joinOrg = async () => {
            setStatus('Joining organization...');
            try {
                // The backend join expects inviteCode (which is currently the orgId)
                const result = await apiClient.joinOrganization({
                    inviteCode: orgId,
                    userId: currentUser.id,
                });

                if (result.error) {
                    setError(result.error);
                    setStatus('Error joining organization.');
                    return;
                }

                setStatus('Success! Redirecting...');

                // Refresh organizations
                const orgsResult = await apiClient.getOrganizations(currentUser.id);
                if (orgsResult.data) {
                    setOrganizations(orgsResult.data);
                }

                // Set the active organization to this one and go to app
                setActiveOrgId(orgId);
                router.push('/app');
            } catch (err) {
                console.error(err);
                setError('An unexpected error occurred.');
                setStatus('Failed to join.');
            }
        };

        joinOrg();
    }, [currentUser, orgId, router, setActiveOrgId, setOrganizations]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white">
            <div className="text-center space-y-4 max-w-sm w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="animate-pulse">
                    <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        {error ? '❌' : '⏳'}
                    </div>
                </div>
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {status}
                </h2>
                {error && (
                    <p className="text-red-400 text-sm mt-2">
                        {error}
                    </p>
                )}
                {error && (
                    <button
                        onClick={() => router.push('/app')}
                        className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm w-full"
                    >
                        Go to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}
