'use client';

import { ReactNode } from 'react';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';

interface AppShellProps {
    children: ReactNode;
    title?: string;
    topBarActions?: ReactNode;
}

export default function AppShell({ children, title, topBarActions }: AppShellProps) {
    return (
        <div className="app-shell">
            <TopBar title={title} actions={topBarActions} />
            <main className="app-content">{children}</main>
            <BottomTabs />
        </div>
    );
}
