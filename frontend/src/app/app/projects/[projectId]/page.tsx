'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SearchInput from '@/components/ui/SearchInput';
import TaskGroupSection from '@/components/tasks/TaskGroupSection';
import TaskFormSheet, { TaskFormData } from '@/components/tasks/TaskFormSheet';
import EmptyState from '@/components/ui/EmptyState';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';
import type { Task, Project, User, TaskStatus, TaskPriority } from '@/types';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { activeOrgId, currentUser } = useApp();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('anyone');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    useEffect(() => {
        if (!activeOrgId) {
            router.push('/app/onboarding/org');
            return;
        }
        loadData();
    }, [activeOrgId, projectId, router]);

    const loadData = async () => {
        if (!activeOrgId) return;

        setIsLoading(true);
        const [tasksResult, usersResult] = await Promise.all([
            apiClient.getProjectTasks(projectId, {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                assigneeId: assigneeFilter !== 'anyone' ? assigneeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                q: searchQuery || undefined,
            }),
            apiClient.getOrgMembers(activeOrgId),
        ]);

        if (tasksResult.data) {
            setTasks(tasksResult.data);
            // Get project name from first task if available
            if (tasksResult.data.length > 0 && tasksResult.data[0].projects?.[0]?.project) {
                setProject(tasksResult.data[0].projects[0].project);
            }
        }
        if (usersResult.data) setUsers(usersResult.data);
        setIsLoading(false);
    };

    const handleCreateTask = async (data: TaskFormData) => {
        if (!activeOrgId || !currentUser) return;

        const result = await apiClient.createTask({
            orgId: activeOrgId,
            projectId: projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || undefined,
            assigneeId: data.assigneeId || undefined,
            collaboratorIds: data.collaboratorIds,
            createdBy: currentUser.id,
        });

        if (result.data) {
            setTasks([result.data, ...tasks]);
        }
    };

    const filterTasks = (tasks: Task[]): Task[] => {
        let filtered = tasks;

        if (searchQuery.trim()) {
            filtered = filtered.filter((task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((task) => task.status === statusFilter);
        }

        if (assigneeFilter === 'me' && currentUser) {
            filtered = filtered.filter((task) => task.assigneeId === currentUser.id);
        } else if (assigneeFilter !== 'anyone') {
            filtered = filtered.filter((task) => task.assigneeId === assigneeFilter);
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter((task) => task.priority === priorityFilter);
        }

        return filtered;
    };

    const groupTasksByStatus = (tasks: Task[]) => {
        const statuses: TaskStatus[] = ['to_do', 'in_progress', 'done'];
        return statuses.map((status) => ({
            status,
            tasks: tasks.filter((task) => task.status === status),
        }));
    };

    const filteredTasks = filterTasks(tasks);
    const groupedTasks = groupTasksByStatus(filteredTasks);

    if (isLoading) {
        return (
            <AppShell title="Project">
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title={project?.name || 'Project'}>
            <div className="flex flex-col gap-lg">
                <SearchInput
                    value={searchQuery}
                    onChange={(q) => {
                        setSearchQuery(q);
                        // Reload with search
                        setTimeout(() => loadData(), 300);
                    }}
                    placeholder="Search tasks in this project..."
                />

                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: '1 1 200px' }}>
                        <label className="input-label">Status</label>
                        <select
                            className="select"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as TaskStatus | 'all');
                                setTimeout(() => loadData(), 100);
                            }}
                        >
                            <option value="all">All</option>
                            <option value="to_do">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: '1 1 200px' }}>
                        <label className="input-label">Assignee</label>
                        <select
                            className="select"
                            value={assigneeFilter}
                            onChange={(e) => {
                                setAssigneeFilter(e.target.value);
                                setTimeout(() => loadData(), 100);
                            }}
                        >
                            <option value="anyone">Anyone</option>
                            <option value="me">Me</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName || user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group" style={{ flex: '1 1 200px' }}>
                        <label className="input-label">Priority</label>
                        <select
                            className="select"
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value as TaskPriority | 'all');
                                setTimeout(() => loadData(), 100);
                            }}
                        >
                            <option value="all">All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                {tasks.length === 0 ? (
                    <EmptyState
                        icon="📋"
                        title="No tasks in this project"
                        description="Create your first task to get started"
                        action={
                            <button className="btn btn-primary" onClick={() => setIsTaskFormOpen(true)}>
                                Create Task
                            </button>
                        }
                    />
                ) : filteredTasks.length === 0 ? (
                    <EmptyState
                        icon="🔍"
                        title="No tasks found"
                        description="Try adjusting your filters"
                    />
                ) : (
                    groupedTasks.map(({ status, tasks }) => (
                        <TaskGroupSection key={status} status={status} tasks={tasks} />
                    ))
                )}
            </div>

            <button className="fab" onClick={() => setIsTaskFormOpen(true)} aria-label="Create task">
                +
            </button>

            <TaskFormSheet
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                onSubmit={handleCreateTask}
                mode="create"
                projects={project ? [project] : []}
                users={users}
                defaultProjectId={projectId}
            />
        </AppShell>
    );
}
