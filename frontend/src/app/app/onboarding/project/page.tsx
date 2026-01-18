'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';

export default function OnboardingProjectPage() {
    const router = useRouter();
    const { activeOrgId } = useApp();
    const [projectName, setProjectName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectName.trim() || !activeOrgId) return;

        setIsSubmitting(true);
        setError('');

        const result = await apiClient.createProject({
            orgId: activeOrgId,
            name: projectName.trim(),
        });

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        if (result.data) {
            router.push(`/app/projects/${result.data.id}`);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="app-shell">
            <div className="app-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        Create Your First Project 📋
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        Projects help you organize your tasks and collaborate with your team
                    </p>
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

                <div className="card-elevated">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                        <div className="input-group">
                            <label className="input-label">Project Name</label>
                            <input
                                type="text"
                                className="input"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g., Marketing Campaign, Product Launch"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
