'use client';

import { useState, FormEvent, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, Project, User } from '@/types';
import Modal from '../ui/Modal';

interface TaskFormSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
    mode: 'create' | 'edit';
    initialData?: Partial<Task>;
    projects: Project[];
    users: User[];
    defaultProjectId?: string;
}

export interface TaskFormData {
    title: string;
    description: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assigneeId: string;
    collaboratorIds: string[];
}

export default function TaskFormSheet({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    projects,
    users,
    defaultProjectId,
}: TaskFormSheetProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        projectId: defaultProjectId || '',
        status: 'to_do',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
        collaboratorIds: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                projectId: initialData.projects?.[0]?.projectId || defaultProjectId || '',
                status: initialData.status || 'to_do',
                priority: initialData.priority || 'medium',
                dueDate: initialData.dueDate
                    ? new Date(initialData.dueDate).toISOString().split('T')[0]
                    : '',
                assigneeId: initialData.assigneeId || '',
                collaboratorIds: initialData.collaborators?.map((c) => c.userId) || [],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                projectId: defaultProjectId || '',
                status: 'to_do',
                priority: 'medium',
                dueDate: '',
                assigneeId: '',
                collaboratorIds: [],
            });
        }
    }, [initialData, defaultProjectId, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Failed to submit task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCollaboratorToggle = (userId: string) => {
        setFormData((prev) => ({
            ...prev,
            collaboratorIds: prev.collaboratorIds.includes(userId)
                ? prev.collaboratorIds.filter((id) => id !== userId)
                : [...prev.collaboratorIds, userId],
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create Task' : 'Edit Task'}
            footer={
                <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.title.trim()}
                    >
                        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                <div className="input-group">
                    <label className="input-label">
                        Title <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <input
                        type="text"
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter task title"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea
                        className="input textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add task description..."
                    />
                </div>

                {mode === 'create' && (
                    <div className="input-group">
                        <label className="input-label">
                            Project <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <select
                            className="select"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            required
                        >
                            <option value="">Select a project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-md">
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Status</label>
                        <select
                            className="select"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value as TaskStatus })
                            }
                        >
                            <option value="to_do">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Priority</label>
                        <select
                            className="select"
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({ ...formData, priority: e.target.value as TaskPriority })
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Due Date</label>
                    <input
                        type="date"
                        className="input"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Assignee</label>
                    <select
                        className="select"
                        value={formData.assigneeId}
                        onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.fullName || user.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Collaborators</label>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-sm)',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: 'var(--space-sm)',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        {users.map((user) => (
                            <label
                                key={user.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    cursor: 'pointer',
                                    padding: 'var(--space-sm)',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'background var(--transition-base)',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = 'var(--color-bg-hover)')
                                }
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.collaboratorIds.includes(user.id)}
                                    onChange={() => handleCollaboratorToggle(user.id)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.875rem' }}>
                                    {user.fullName || user.email}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
