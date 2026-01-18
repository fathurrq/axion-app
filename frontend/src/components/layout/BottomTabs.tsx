'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface BottomTabsProps {
    children?: ReactNode;
}

export default function BottomTabs({ children }: BottomTabsProps) {
    const pathname = usePathname();

    const tabs = [
        { href: '/app', label: 'Home', icon: '🏠' },
        { href: '/app/projects', label: 'Projects', icon: '📁' },
        { href: '/app/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <nav className="bottom-tabs">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`bottom-tab ${pathname === tab.href ? 'active' : ''}`}
                >
                    <span className="bottom-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                </Link>
            ))}
        </nav>
    );
}
