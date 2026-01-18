'use client';

import Link from 'next/link';
import type { Task } from '@/types';
import { getStatusLabel, getPriorityLabel, formatDate, isOverdue } from '@/lib/utils';

interface TaskRowProps {
    task: Task;
}

export default function TaskRow({ task }: TaskRowProps) {
    const dueDate = task.dueDate ? formatDate(task.dueDate) : null;
    const overdue = isOverdue(task.dueDate);

    return (
        <Link href={`/app/tasks/${task.id}`} className="task-row">
            <div className="task-row-content">
                <div className="task-row-title">{task.title}</div>
                <div className="task-row-meta">
                    <span className={`badge badge-priority-${task.priority}`}>
                        {getPriorityLabel(task.priority)}
                    </span>
                    {dueDate && (
                        <span style={{ color: overdue ? 'var(--color-danger)' : 'inherit' }}>
                            📅 {dueDate}
                        </span>
                    )}
                    {task.assignee && (
                        <span>👤 {task.assignee.fullName || task.assignee.email}</span>
                    )}
                </div>
            </div>
            <div className="task-row-actions">
                <span className={`badge badge-status-${task.status}`}>
                    {getStatusLabel(task.status)}
                </span>
            </div>
        </Link>
    );
}
