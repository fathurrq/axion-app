'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SearchInput from '@/components/ui/SearchInput';
import FilterChips from '@/components/ui/FilterChips';
import TaskGroupSection from '@/components/tasks/TaskGroupSection';
import TaskFormSheet, { TaskFormData } from '@/components/tasks/TaskFormSheet';
import EmptyState from '@/components/ui/EmptyState';
import { apiClient } from '@/lib/api-client';
import { useApp } from '@/contexts/AppContext';
import type { Task, Project, User, TaskStatus } from '@/types';
import { isOverdue, isDueSoon } from '@/lib/utils';

type FilterType = 'all' | 'due_soon' | 'overdue' | 'high_priority';

export default function HomePage() {
    const router = useRouter();
    const { activeOrgId, currentUser } = useApp();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    useEffect(() => {
        if (!activeOrgId) {
            router.push('/app/onboarding/org');
            return;
        }
        loadData();
    }, [activeOrgId, currentUser, router]);

    const loadData = async () => {
        if (!activeOrgId || !currentUser) return; // Wait for user

        setIsLoading(true);
        const [tasksResult, projectsResult, usersResult] = await Promise.all([
            apiClient.getMyTasks(activeOrgId, currentUser.id),
            apiClient.getProjects(activeOrgId),
            apiClient.getOrgMembers(activeOrgId),
        ]);

        if (tasksResult.data) setTasks(tasksResult.data);
        if (projectsResult.data) setProjects(projectsResult.data);
        if (usersResult.data) setUsers(usersResult.data);
        setIsLoading(false);
    };

    const handleCreateTask = async (data: TaskFormData) => {
        if (!activeOrgId || !currentUser) return;

        const result = await apiClient.createTask({
            orgId: activeOrgId,
            projectId: data.projectId,
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

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter((task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply filter
        switch (activeFilter) {
            case 'due_soon':
                filtered = filtered.filter((task) => isDueSoon(task.dueDate));
                break;
            case 'overdue':
                filtered = filtered.filter((task) => isOverdue(task.dueDate));
                break;
            case 'high_priority':
                filtered = filtered.filter((task) => task.priority === 'high');
                break;
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

    const filterChips = [
        { id: 'all', label: 'All' },
        { id: 'due_soon', label: 'Due Soon' },
        { id: 'overdue', label: 'Overdue' },
        { id: 'high_priority', label: 'High Priority' },
    ];

    if (isLoading) {
        return (
            <AppShell title="My Tasks">
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading...</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="My Tasks">
            <div className="flex flex-col gap-lg">
                <div className="flex flex-col gap-md">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search your tasks..."
                    />
                    <FilterChips
                        chips={filterChips}
                        activeChip={activeFilter}
                        onChange={(id) => setActiveFilter(id as FilterType)}
                    />
                </div>

                {tasks.length === 0 ? (
                    <EmptyState
                        icon="🎯"
                        title="No tasks yet"
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
                        description="Try adjusting your search or filters"
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
                projects={projects}
                users={users}
            />
        </AppShell>
    );
}
