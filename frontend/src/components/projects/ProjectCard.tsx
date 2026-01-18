'use client';

import Link from 'next/link';
import type { Project } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link href={`/app/projects/${project.id}`} className="project-card">
            <h3 className="project-card-title">{project.name}</h3>
            <div className="project-card-meta">
                <span>📅 Created {formatDateTime(project.createdAt)}</span>
                {project.taskCount !== undefined && <span>📋 {project.taskCount} tasks</span>}
            </div>
        </Link>
    );
}
