import type { Href } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';

type LastTabContextType = {
    lastTab: Href | null;
    setLastTab: (tab: Href) => void;
};

const LastTabContext = createContext<LastTabContextType | null>(null);

export function LastTabProvider({ children }: { children: React.ReactNode }) {
    const [lastTab, setLastTab] = useState<Href | null>(null);

    return (
        <LastTabContext.Provider value={{ lastTab, setLastTab }}>
            {children}
        </LastTabContext.Provider>
    );
}

export function useLastTab() {
    const ctx = useContext(LastTabContext);
    if (!ctx) {
        throw new Error('useLastTab must be used inside LastTabProvider');
    }
    return ctx;
}
