'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';

export default function OnboardingOrgPage() {
    const router = useRouter();
    const { setActiveOrgId, setOrganizations, currentUser } = useApp();
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [orgName, setOrgName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleCreateOrg = async (e: FormEvent) => {
        e.preventDefault();
        if (!orgName.trim() || !currentUser) return;

        setIsSubmitting(true);
        setError('');

        const result = await apiClient.createOrganization({
            name: orgName.trim(),
            ownerId: currentUser.id
        });

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        if (result.data) {
            setActiveOrgId(result.data.id);
            setOrganizations([result.data]);
            router.push('/app/onboarding/project');
        }

        setIsSubmitting(false);
    };

    const handleJoinOrg = async (e: FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim() || !currentUser) return;

        setIsSubmitting(true);
        setError('');

        const result = await apiClient.joinOrganization({
            inviteCode: inviteCode.trim(),
            userId: currentUser.id
        });

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        if (result.data) {
            setActiveOrgId(result.data.id);
            const orgsResult = await apiClient.getOrganizations(currentUser.id);
            if (orgsResult.data) {
                setOrganizations(orgsResult.data);
            }
            router.push('/app');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="app-shell">
            <div className="app-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        Welcome to Axion 🚀
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        Let's get you started by creating or joining an organization
                    </p>
                </div>

                <div className="flex gap-md mb-lg">
                    <button
                        className={`btn ${mode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('create')}
                        style={{ flex: 1 }}
                    >
                        Create Organization
                    </button>
                    <button
                        className={`btn ${mode === 'join' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('join')}
                        style={{ flex: 1 }}
                    >
                        Join Organization
                    </button>
                </div>

                {error && (
                    <div
                        className="card"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'var(--color-danger)',
                            marginBottom: 'var(--space-lg)',
                        }}
                    >
                        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
                    </div>
                )}

                {mode === 'create' ? (
                    <div className="card-elevated">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                            Create Your Organization
                        </h2>
                        <form onSubmit={handleCreateOrg} className="flex flex-col gap-lg">
                            <div className="input-group">
                                <label className="input-label">Organization Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="e.g., Acme Inc."
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Organization'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="card-elevated">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                            Join an Organization
                        </h2>
                        <form onSubmit={handleJoinOrg} className="flex flex-col gap-lg">
                            <div className="input-group">
                                <label className="input-label">Invite Code</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="Enter your invite code"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Joining...' : 'Join Organization'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
