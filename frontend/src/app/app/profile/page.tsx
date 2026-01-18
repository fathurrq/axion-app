'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { currentUser, organizations, activeOrgId, setActiveOrgId } = useApp();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/api/auth/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <AppShell title="Profile">
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </AppShell>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AppShell title="Profile">
            <div className="flex flex-col gap-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* User Info Card */}
                <div className="card text-center">
                    <div
                        className="avatar avatar-lg"
                        style={{
                            width: '100px',
                            height: '100px',
                            fontSize: '2.5rem',
                            margin: '0 auto var(--space-lg)',
                        }}
                    >
                        {user.picture ? (
                            <img src={user.picture} alt={user.name || 'User'} />
                        ) : (
                            getInitials(user.name || user.email || '')
                        )}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                        {user.name || 'User'}
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
                        {user.email}
                    </p>
                </div>

                {/* Organizations */}
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                        Organizations
                    </h3>
                    {organizations.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            You're not part of any organizations yet.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-sm">
                            {organizations.map((org) => (
                                <div
                                    key={org.id}
                                    className={`card ${activeOrgId === org.id ? 'card-elevated' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        padding: 'var(--space-md)',
                                        border: activeOrgId === org.id ? '2px solid var(--color-primary)' : undefined,
                                    }}
                                    onClick={() => setActiveOrgId(org.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p style={{ fontWeight: 500 }}>{org.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                {activeOrgId === org.id ? '✓ Active' : 'Click to switch'}
                                            </p>
                                        </div>
                                        {activeOrgId === org.id && (
                                            <span
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'var(--color-success)',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account Info */}
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                        Account Information
                    </h3>
                    <div className="flex flex-col gap-md">
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Email</p>
                            <p style={{ fontSize: '0.875rem' }}>{user.email}</p>
                        </div>
                        {user.email_verified !== undefined && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    Email Verified
                                </p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {user.email_verified ? '✅ Yes' : '❌ No'}
                                </p>
                            </div>
                        )}
                        {currentUser && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>User ID</p>
                                <p
                                    style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        color: 'var(--color-text-tertiary)',
                                    }}
                                >
                                    {currentUser.id}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-md">
                    <a href="/api/auth/logout" className="btn btn-danger btn-lg" style={{ textAlign: 'center' }}>
                        Logout
                    </a>
                </div>
            </div>
        </AppShell>
    );
}
