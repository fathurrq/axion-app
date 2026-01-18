'use client';

import type { Task, TaskStatus } from '@/types';
import { getStatusLabel } from '@/lib/utils';
import TaskRow from './TaskRow';
import EmptyState from '../ui/EmptyState';

interface TaskGroupSectionProps {
    status: TaskStatus;
    tasks: Task[];
}

export default function TaskGroupSection({ status, tasks }: TaskGroupSectionProps) {
    return (
        <div className="task-group">
            <div className="task-group-header">
                <h2 className="task-group-title">
                    {getStatusLabel(status)}
                    <span className="task-group-count">({tasks.length})</span>
                </h2>
            </div>
            <div className="task-group-list">
                {tasks.length === 0 ? (
                    <EmptyState
                        icon="✨"
                        title={`No ${getStatusLabel(status).toLowerCase()} tasks`}
                        description="Tasks will appear here when they match this status"
                    />
                ) : (
                    tasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
            </div>
        </div>
    );
}
