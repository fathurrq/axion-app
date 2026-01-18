'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import CommentList from '@/components/comments/CommentList';
import CommentComposer from '@/components/comments/CommentComposer';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';
import type { Task, Comment, User, TaskStatus, TaskPriority } from '@/types';
import { getStatusLabel, getPriorityLabel, formatDate, getInitials } from '@/lib/utils';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { activeOrgId, currentUser } = useApp();
    const taskId = params.taskId as string;

    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!activeOrgId) {
            router.push('/app/onboarding/org');
            return;
        }
        loadData();
    }, [activeOrgId, taskId, router]);

    const loadData = async () => {
        if (!activeOrgId) return;

        setIsLoading(true);
        const [taskResult, commentsResult, usersResult] = await Promise.all([
            apiClient.getTask(taskId),
            apiClient.getTaskComments(taskId),
            apiClient.getOrgMembers(activeOrgId),
        ]);

        if (taskResult.data) setTask(taskResult.data);
        if (commentsResult.data) setComments(commentsResult.data);
        if (usersResult.data) setUsers(usersResult.data);
        setIsLoading(false);
    };

    const handleUpdateTask = async (updates: Partial<Task>) => {
        if (!task || !currentUser) return;

        setIsSaving(true);
        const result = await apiClient.updateTask(taskId, {
            title: updates.title,
            description: updates.description,
            status: updates.status,
            priority: updates.priority,
            dueDate: updates.dueDate,
            assigneeId: updates.assigneeId,
            collaboratorIds: updates.collaborators?.map((c) => c.userId),
            userId: currentUser!.id,
        });

        if (result.data) {
            setTask(result.data);
        }
        setIsSaving(false);
    };

    const handleAddComment = async (content: string) => {
        if (!currentUser) return;
        const result = await apiClient.createComment(taskId, { body: content, userId: currentUser.id });
        if (result.data) {
            setComments([...comments, result.data]);
        }
    };

    const handleDeleteTask = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const result = await apiClient.deleteTask(taskId);
        if (!result.error) {
            router.push('/app');
        }
    };

    const handleCollaboratorToggle = (userId: string) => {
        if (!task) return;

        const currentCollaborators = task.collaborators || [];
        const isCollaborator = currentCollaborators.some((c) => c.userId === userId);

        const newCollaborators = isCollaborator
            ? currentCollaborators.filter((c) => c.userId !== userId)
            : [...currentCollaborators, { taskId: task.id, userId, user: users.find((u) => u.id === userId) }];

        handleUpdateTask({ ...task, collaborators: newCollaborators });
    };

    if (isLoading) {
        return (
            <AppShell title="Task">
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </AppShell>
        );
    }

    if (!task) {
        return (
            <AppShell title="Task Not Found">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <h3 className="empty-state-title">Task not found</h3>
                    <p className="empty-state-description">This task may have been deleted or you don't have access to it.</p>
                    <button className="btn btn-primary" onClick={() => router.push('/app')}>
                        Go to My Tasks
                    </button>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            title="Task Details"
            topBarActions={
                <button className="btn btn-danger btn-sm" onClick={handleDeleteTask}>
                    Delete
                </button>
            }
        >
            <div className="flex flex-col gap-xl">
                {/* Title */}
                <div className="card">
                    <div className="input-group">
                        <label className="input-label">Title</label>
                        <input
                            type="text"
                            className="input"
                            value={task.title}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            onBlur={() => handleUpdateTask({ title: task.title })}
                            style={{ fontSize: '1.25rem', fontWeight: 600 }}
                        />
                    </div>
                </div>

                {/* Status, Priority, Due Date */}
                <div className="card">
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: '1 1 200px' }}>
                            <label className="input-label">Status</label>
                            <select
                                className="select"
                                value={task.status}
                                onChange={(e) => {
                                    const newStatus = e.target.value as TaskStatus;
                                    setTask({ ...task, status: newStatus });
                                    handleUpdateTask({ status: newStatus });
                                }}
                                disabled={isSaving}
                            >
                                <option value="to_do">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ flex: '1 1 200px' }}>
                            <label className="input-label">Priority</label>
                            <select
                                className="select"
                                value={task.priority}
                                onChange={(e) => {
                                    const newPriority = e.target.value as TaskPriority;
                                    setTask({ ...task, priority: newPriority });
                                    handleUpdateTask({ priority: newPriority });
                                }}
                                disabled={isSaving}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ flex: '1 1 200px' }}>
                            <label className="input-label">Due Date</label>
                            <input
                                type="date"
                                className="input"
                                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    const newDueDate = e.target.value || null;
                                    setTask({ ...task, dueDate: newDueDate });
                                    handleUpdateTask({ dueDate: newDueDate });
                                }}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                {/* Assignee */}
                <div className="card">
                    <div className="input-group">
                        <label className="input-label">Assignee</label>
                        <select
                            className="select"
                            value={task.assigneeId || ''}
                            onChange={(e) => {
                                const newAssigneeId = e.target.value || null;
                                setTask({ ...task, assigneeId: newAssigneeId });
                                handleUpdateTask({ assigneeId: newAssigneeId });
                            }}
                            disabled={isSaving}
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName || user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="card">
                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input textarea"
                            value={task.description || ''}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                            onBlur={() => handleUpdateTask({ description: task.description })}
                            placeholder="Add a description..."
                            rows={6}
                        />
                    </div>
                </div>

                {/* Collaborators */}
                <div className="card">
                    <div className="input-group">
                        <label className="input-label">Collaborators</label>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                            {task.collaborators && task.collaborators.length > 0 ? (
                                task.collaborators.map((collab) => (
                                    <div
                                        key={collab.userId}
                                        className="chip active"
                                        onClick={() => handleCollaboratorToggle(collab.userId)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {collab.user?.fullName || collab.user?.email || 'Unknown'}
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    No collaborators yet
                                </p>
                            )}
                        </div>
                        <details>
                            <summary
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-primary)',
                                    marginBottom: 'var(--space-sm)',
                                }}
                            >
                                Add/Remove Collaborators
                            </summary>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {users.map((user) => {
                                    const isCollaborator = task.collaborators?.some((c) => c.userId === user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            className={`chip ${isCollaborator ? 'active' : ''}`}
                                            onClick={() => handleCollaboratorToggle(user.id)}
                                        >
                                            {user.fullName || user.email}
                                        </button>
                                    );
                                })}
                            </div>
                        </details>
                    </div>
                </div>

                {/* Project Info */}
                {task.projects && task.projects.length > 0 && (
                    <div className="card">
                        <div className="input-group">
                            <label className="input-label">Project</label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                📁 {task.projects[0].project?.name || 'Unknown Project'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                        Comments ({comments.length})
                    </h3>
                    <div className="flex flex-col gap-lg">
                        <CommentComposer
                            onSubmit={handleAddComment}
                            currentUserName={currentUser?.fullName || currentUser?.email}
                        />
                        <CommentList comments={comments} />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
