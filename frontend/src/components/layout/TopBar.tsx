'use client';

import { useApp } from '@/contexts/AppContext';
import { ReactNode } from 'react';

interface TopBarProps {
    title?: string;
    actions?: ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
    const { organizations, activeOrgId } = useApp();
    const activeOrg = organizations.find((org) => org.id === activeOrgId);

    return (
        <header className="top-bar">
            <div className="flex items-center gap-md">
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {title || 'Axion'}
                </h1>
                {activeOrg && (
                    <span
                        style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                            padding: '0.25rem 0.75rem',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-full)',
                        }}
                    >
                        {activeOrg.name}
                    </span>
                )}
            </div>
            {actions && <div className="flex items-center gap-md">{actions}</div>}
        </header>
    );
}
