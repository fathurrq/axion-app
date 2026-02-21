'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Organization, User } from '@/types';

interface AppContextType {
    activeOrgId: string | null;
    setActiveOrgId: (orgId: string | null) => void;
    organizations: Organization[];
    setOrganizations: (orgs: Organization[]) => void;
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    isInitialSyncComplete: boolean;
    setIsInitialSyncComplete: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isInitialSyncComplete, setIsInitialSyncComplete] = useState<boolean>(false);

    // Load active org from localStorage
    useEffect(() => {
        const savedOrgId = localStorage.getItem('activeOrgId');
        if (savedOrgId) {
            setActiveOrgIdState(savedOrgId);
        }
    }, []);

    // Save active org to localStorage
    const setActiveOrgId = (orgId: string | null) => {
        setActiveOrgIdState(orgId);
        if (orgId) {
            localStorage.setItem('activeOrgId', orgId);
        } else {
            localStorage.removeItem('activeOrgId');
        }
    };

    return (
        <AppContext.Provider
            value={{
                activeOrgId,
                setActiveOrgId,
                organizations,
                setOrganizations,
                currentUser,
                setCurrentUser,
                isInitialSyncComplete,
                setIsInitialSyncComplete,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
