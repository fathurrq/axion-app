'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ProjectCard from '@/components/projects/ProjectCard';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';
import type { Project } from '@/types';

export default function ProjectsPage() {
    const router = useRouter();
    const { activeOrgId } = useApp();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!activeOrgId) {
            router.push('/app/onboarding/org');
            return;
        }
        loadProjects();
    }, [activeOrgId, router]);

    const loadProjects = async () => {
        if (!activeOrgId) return;

        setIsLoading(true);
        const result = await apiClient.getProjects(activeOrgId);
        if (result.data) {
            setProjects(result.data);
        }
        setIsLoading(false);
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !activeOrgId) return;

        setIsSubmitting(true);
        const result = await apiClient.createProject({
            orgId: activeOrgId,
            name: newProjectName.trim(),
        });

        if (result.data) {
            setProjects([result.data, ...projects]);
            setNewProjectName('');
            setIsCreateModalOpen(false);
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <AppShell title="Projects">
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            title="Projects"
            topBarActions={
                <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                    + New Project
                </button>
            }
        >
            {projects.length === 0 ? (
                <EmptyState
                    icon="📁"
                    title="No projects yet"
                    description="Create your first project to organize your tasks"
                    action={
                        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                            Create Project
                        </button>
                    }
                />
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 'var(--space-lg)',
                    }}
                >
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setNewProjectName('');
                }}
                title="Create New Project"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setNewProjectName('');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateProject}
                            disabled={!newProjectName.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </button>
                    </>
                }
            >
                <div className="input-group">
                    <label className="input-label">Project Name</label>
                    <input
                        type="text"
                        className="input"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g., Marketing Campaign"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newProjectName.trim()) {
                                handleCreateProject();
                            }
                        }}
                    />
                </div>
            </Modal>
        </AppShell>
    );
}
